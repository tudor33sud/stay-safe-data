const { check, validationResult } = require('express-validator/check');

const tags = require('./tags');
const events = require('./events');
module.exports = {
    events: events,
    tags: tags,
    result: validationResult
};