const express = require('express');
const router = express.Router();
const ApiError = require('../error/api-error');
const logger = require('../utils/log').logger;
const validation = require('../validation');
const validationResult = validation.result;
const db = require('../db');

router.get('/', [validation.tags.getAll()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const tags = await db.tag.findAll({ where: {} });
        if (tags.length === 0) {
            return res.status(204).send();
        }
        res.json(tags);
    } catch (err) {
        next(err);
    }
});

router.post('/', [validation.tags.createOne()], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }
        const createdTag = await db.tag.create({
            name: req.body.name
        });
        res.status(201).json(createdTag);
    } catch (err) {
        next(err);
    }
})

module.exports = router;