const express = require('express');
const router = express.Router();
const ApiError = require('../error/api-error');
const logger = require('../utils/log').logger;
const validation = require('../validation');
const validationResult = validation.result;
const db = require('../db');

router.get('/', [validation.events.getAll()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const events = db.event.findAll({ where: {} });
        if (events.length === 0) {
            return res.status(204).send();
        }
        res.json(members);
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
            const { priority, description, performerType, location, tags } = req.body;
            const foundTags = await db.tag.findAll({
                where: { id: tags }
            });
            if (foundTags.length !== tags.length) {
                throw new ApiError(`Cannot find all tags`, 404);
            }
            const createdEvent = await db.event.create({
                priority,
                description,
                performerType,
                location: {
                    latlon: location
                },
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

module.exports = router;