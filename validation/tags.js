const { sanitizeQuery } = require('express-validator/filter');
const { check, validationResult, body, query, header, param, allOf, oneOf } = require('express-validator/check');

function getAllTags() {
    return [
        query('page').optional().isInt({ min: 0 }),
        query('size').optional().isInt({ min: 0, max: 25 }),
        sanitizeQuery('page').toInt().customSanitizer(value => {
            return value;
        }),
        sanitizeQuery('size').toInt().customSanitizer(value => {
            return value;
        })
    ];
}

function createTag() {
    return [
        body('name').exists().isLength({ min: 3, max: 20 }).matches(/[\S]{3,20}/i)
    ]
}


module.exports = {
    getAll: getAllTags,
    createOne: createTag
}