const environment = process.env.NODE_ENV || 'localhost';
module.exports = {
    port: process.env.PORT || 3007,
    tracingHeaderKey: process.env.TRACING_HEADER_KEY || 'x-ss-request-id',
    jwtHeaderKey: process.env.JWT_HEADER_KEY || 'x-ss-jwt',
    serviceName: 'stay-safe-data'
};