const uuid = require('uuid');

const REQ_ID_KEY = 'x-request-id';

/**
 * Add request id to the specified header key to response and request objects. Also inject id property to the req object for easier usage within the app.
 * @param {String} headerKey Header name to append request id to. Defaults to `x-request-id` 
 */
function addRequestId(headerKey = REQ_ID_KEY) {
    if (typeof headerKey !== 'string') {
        throw new Error('Header key should be a string');
    }
    return (req, res, next) => {
        const reqId = req.headers[headerKey];
        if (typeof reqId != 'undefined') {
            req.id = reqId;
            res.header(headerKey, reqId);
            return next();
        }

        const identifier = getUniqueId();
        req.headers[headerKey] = identifier;
        res.header(headerKey, identifier);
        req.id = identifier;
        next();
    }
}



function getUniqueId() {
    return uuid.v4();
}

module.exports = exports = addRequestId;