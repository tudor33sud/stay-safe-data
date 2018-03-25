const { check, validationResult, body, query, header, param, allOf, oneOf } = require('express-validator/check');
const _ = require('lodash');
const helpers = require('./_helpers');
function getEvents() {
    return [
        //param('userId', 'User id should be a non empty string').isLength({ min: 1, max: 50 })
    ];
}
const priorities = ['low', 'medium', 'high'];
const performerTypes = ['ambulance','doctor'];

function createEvent() {
    return [
        body('priority', `Priorities should be one of: ${priorities.join(' ')}`).isIn(priorities),
        body('description', 'Description should be a string between 5 and 255 characters').isLength({ min: 5, max: 255 }),
        body('performerType', `Performer type should be one of:${performerTypes.join(' ')} `).isIn(performerTypes),
        body('location', 'Location should be a validat latlong string').isLatLong(),
        body('tags', 'Tags should be array of tags ids').custom(helpers.validators.isArrayOfIntegers)
    ]
}

module.exports = {
    getAll: getEvents,
    create: createEvent,
}