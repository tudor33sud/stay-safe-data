const environment = process.env.NODE_ENV || 'localhost';
const winston = require('winston');
const appConfig = require('../config');
const _ = require('lodash');


const loggingFormatter = function (options) {
    if (options.level !== 'debug' && typeof options.meta.req === 'undefined') {
        throw new Error(`Please provide request object as metadata for logs.`);
    }
    const timestamp = options.timestamp();
    const logLevel = options.level.toUpperCase();
    const requestId = _.get(options.meta, 'req.id');
    const message = options.message || 'undefined';
    const referrer = _.get(options.meta, 'req.referrer');
    const stack = _.get(options.meta, 'stack');

    return JSON.stringify({
        message,
        timestamp,
        requestId,
        logLevel,
        service: appConfig.SERVICE_NAME,
        stackTrace: stack,
        environment,
        referrer
    });


}

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function () {
                return new Date().toISOString();
            },
            formatter: loggingFormatter
        })
    ]
});

switch (environment) {
    case 'localhost':
        logger.level = 'debug';
        break;
    case 'development':
        logger.level = 'info';
        break;
    case 'production':
        logger.level = 'info';
        break;
    default:
        logger.level = 'debug';
}

module.exports = {
    logger: logger
}