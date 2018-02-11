/**
 * @typedef {Object} ResolveErrorOptions
 * @property {String} unknownErrorMessage Message to send to response for internal errors
 * @property {Boolean} log=false Flag if error should be logged
 * @property {Boolean} displayErrorReason=false Flag to determine if internal server error should display the error message also.
 * @typedef {Object} CorsOptions
 * @property {String} allowedOrigin 
 */

const _ = require('lodash');
const ApiError = require('../error/api-error');
const logger = require('./log.js').logger;
const appConfig = require('../config');


/**
 * Default resolving for errors and sending appropriate message with the response
 * @param {Error} err error object
 * @param {Express.Request} req express request object
 * @param {Express.Response} res express response object
 * @param {ResolveErrorOptions} options Options Object
 */
function resolveError(err, req, res, options) {
    const opts = _.extend({
        unknownErrorMessage: 'Internal Server Error',
        log: false,
        displayErrorReason: false
    }, options || {});

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.toJSON());
    } else if (err.statusCode) {
        return res.status(err.statusCode).json(err.error);
    } else {
        if (opts.log) {
            logger.error(`${opts.unknownErrorMessage}. Reason: ${err.message}`, { req, stack: err.stack });
        }
        const errorMessage = opts.displayErrorReason ? `${opts.unknownErrorMessage}. Reason: ${err.message}` : `${opts.unknownErrorMessage}`;
        return res.status(500).json({ message: errorMessage });
    }
}


function cors(options = {}) {
    options.allowedOrigin = options.allowedOrigin || '*';
    return function (req, res, next) {
        res.header("Access-Control-Allow-Origin", options.allowedOrigin);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
        res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
        next();
    }
}


function defaultErrorHandler(environment) {
    if (environment == 'localhost') {
        return developmentErrorHandler;
    }
    return productionErrorHandler;
}

function developmentErrorHandler(err, req, res, next) {
    resolveError(err, req, res, { log: true, req, displayErrorReason: true })
}

function productionErrorHandler(err, req, res, next) {
    resolveError(err, req, res, { log: true, req })
}

function customHeaders() {
    return (req, res, next) => {
        try {
            req.customHeaders = {
                [appConfig.tracingHeaderKey]: req.id
            }
            //need to check if kauth.grant exists in order to pass JWT
            if (typeof req.kauth.grant.access_token.token !== 'undefined') {
                req.customHeaders[appConfig.jwtHeaderKey] = req.kauth.grant.access_token.token;
            }
            next();
        } catch (err) {
            next(err);
        }
    }
}


module.exports = {
    middleware: {
        cors,
        defaultErrorHandler,
        customHeaders
    }
}