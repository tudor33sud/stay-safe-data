const express = require('express');
const router = express.Router();
const ApiError = require('../error/api-error');
const logger = require('../utils/log').logger;
const validation = require('../validation');
const validationResult = validation.result;
const db = require('../db');
const Op = db.sequelize.Op;
const storage = require('../service/storage');
const fs = require('fs');

router.get('/', [validation.events.getAll()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const events = await db.event.findAll({
            where: {
                requester: {
                    identifier: {
                        [Op.eq]: req.referrer.id
                    }
                }
            },
            include: [{ model: db.tag }],
            order: [[db.sequelize.literal(`status='finished', status='busy', status='requested'`)],
            ["createdAt", "DESC"]]
        });
        if (events.length === 0) {
            return res.status(204).send();
        }
        res.json(events);
    } catch (err) {
        next(err);
    }
});

router.get('/:eventId', async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const event = await db.event.find({
            where: {
                id: req.params.eventId,
                [Op.or]: {
                    requester: {
                        identifier: req.referrer.id
                    },
                    performer: {
                        identifier: req.referrer.id
                    }
                }

            }
        });
        if (!event) {
            throw new ApiError(`Resource not found`, 404);
        }
        res.json(event);
    } catch (err) {
        next(err);
    }
});

router.post('/', [validation.events.create()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const transaction = await db.sequelize.transaction();
        try {
            const { priority, description, performerType, location, tags, address } = req.body;
            const foundTags = await db.tag.findAll({
                where: { id: tags }
            });
            if (foundTags.length !== tags.length) {
                throw new ApiError(`Cannot find all tags`, 404);
            }
            const splittedLocation = location.trim().split(',');
            const locationLatLng = {
                lat: splittedLocation[0],
                lng: splittedLocation[1],
                address: address
            };
            const createdEvent = await db.event.create({
                priority,
                description,
                performerType,
                location: locationLatLng,
                requester: db.event.getRequester(req)
            }, { transaction: transaction });
            const addEvents = foundTags.map(tag => {
                return createdEvent.addTag(tag, { transaction: transaction });
            });
            await Promise.all(addEvents);
            await transaction.commit();
            res.status(201).json(createdEvent);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        next(err);
    }
});

router.delete('/:eventId', async (req, res, next) => {
    try {
        const event = await db.event.findById(req.params.eventId);
        if (!event) {
            throw new ApiError('Event not found', 404);
        }
        const deleted = await event.destroy();
        res.status(204).json(deleted);
    } catch (err) {
        next(err);
    }
});

router.put('/:eventId/attachments', storage.upload.single('image'), async (req, res, next) => {
    try {
        const event = await db.event.findById(req.params.eventId);
        if (!event) {
            throw new ApiError('Event not found', 404);
        }
        if (!req.file) {
            throw new ApiError('No file given', 400);
        }
        const file = req.file;
        event.attachments.push({ id: (event.attachments.length + 1).toString(), location: file.path, mimeType: file.mimetype });
        event.set({
            attachments: event.attachments
        });
        const updated = await event.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
});

router.get('/:eventId/attachments/:attachmentId', async (req, res, next) => {
    try {
        const event = await db.event.find({
            where: {
                id: req.params.eventId,
                attachments: {
                    [Op.contains]: [{
                        id: req.params.attachmentId
                    }]
                }
            }
        });
        if (!event) {
            throw new ApiError(`Resource not found`, 404);
        }
        const attachment = event.attachments.filter(attachment => {
            return attachment.id == req.params.attachmentId
        })[0];
        res.setHeader(`Content-Type`, attachment.mimeType);
        fs.createReadStream(attachment.location).on('error', err => {
            next(err);
        }).pipe(res);
    } catch (err) {
        next(err);
    }
});

module.exports = router;