const { check, validationResult, body, query, header, param, allOf, oneOf } = require('express-validator/check');

function getEvents() {
    return [
        param('userId', 'User id should be a non empty string').isLength({ min: 1, max: 50 })
    ];
}

module.exports = {
    getAll: getEvents
}