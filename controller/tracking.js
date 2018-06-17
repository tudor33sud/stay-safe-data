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
router.get('/events', [validation.events.getAll()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }

        function getRequestedEvents(lat, lng) {
            let whereClause;
            if (!lat || !lng) {
                whereClause = {
                    status: 'requested'
                }
            } else {
                whereClause = db.sequelize.and(db.sequelize.where(
                    db.sequelize.fn(`ST_DWithin`,
                        db.sequelize.col(`position`),
                        db.sequelize.fn('ST_SetSRID',
                            db.sequelize.fn(`ST_MakePoint`, req.query.lng, req.query.lat),
                            4326),
                        0.032),
                    true), db.sequelize.literal(`status='requested'`));
            }
            return db.event.findAll({
                where: whereClause,
                include: [{ model: db.tag }],
                order: db.sequelize.fn('ST_Distance', db.sequelize.col('position'), db.sequelize.fn('ST_SetSRID',
                    db.sequelize.fn(`ST_MakePoint`, req.query.lng, req.query.lat),
                    4326))
            });
        }

        function getActiveEvents(referrer) {
            return db.event.findAll({
                where: {
                    status: 'busy',
                    performer: {
                        identifier: {
                            [Op.eq]: referrer.id
                        }
                    }
                },
                include: [{ model: db.tag }]
            });
        }


        const events = req.query.active ? await getActiveEvents(req.referrer) : await getRequestedEvents(req.query.lat, req.query.lng)
        if (events.length === 0) {
            return res.status(204).send();
        }
        res.json(events);
    } catch (err) {
        next(err);
    }
});

router.put('/events/:eventId/performer', async (req, res, next) => {
    try {
        if (!req.referrer.id) {
            throw new ApiError(`Permission Denied`, 403);
        }
        const transaction = await db.sequelize.transaction();
        try {
            const event = await db.event.findById(req.params.eventId, { transaction });
            if (!event) {
                throw new ApiError(`Event not found`, 404);
            }

            if (event.status !== 'requested') {
                throw new ApiError(`Event already taken`, 409);
            }

            event.set({
                performer: db.event.getRequester(req),
                status: "busy",
                statusReason: "Help is on the way!"
            }, { transaction });
            const updatedEvent = await event.save({ transaction });
            await transaction.commit();
            res.json(updatedEvent);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }


    } catch (err) {
        next(err);
    }
});

router.post('/events/:eventId/actions/finish', async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction();
        try {
            const event = await db.event.find({
                where: {
                    id: req.params.eventId,
                    status: 'busy',
                    performer: {
                        identifier: {
                            [Op.eq]: req.referrer.id
                        }
                    }
                }
            }, { transaction });
            if (!event) {
                throw new ApiError(`Resource not found`, 404);
            }
            const duration = new Date().getTime() - (new Date(event.createdAt)).getTime();
            event.set({
                status: "finished",
                statusReason: "Event was successfully acted upon.",
                duration
            }, { transaction });
            const updatedEvent = await event.save({ transaction });
            await transaction.commit();
            res.json(updatedEvent);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
})

module.exports = router;