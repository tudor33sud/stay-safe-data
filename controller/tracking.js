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
        const events = await db.event.findAll({
            where: {
                status: 'requested'
            }
        });
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

            event.set({
                performer: db.event.getRequester(req),
                status: "busy",
                statusReason: "Help is on the way!"
            });
            const updatedEvent = await event.save({ transaction });
            // const updatedEvent = await db.event.update({
            //     performer: db.event.getRequester(req),
            //     status: "busy",
            //     statusReason: "Help is on the way"
            // }, { transaction });
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

module.exports = router;