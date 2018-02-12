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

module.exports = router;