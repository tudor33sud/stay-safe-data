const jwt = require('jsonwebtoken');
const appConfig = require('../config');

function getReferrer(req) {
    const accessToken = getJWT(req);
    const data = jwt.decode(accessToken);
    if (data.clientId) {
        return data.clientId;
    }
    if (data.email) {
        return data.email;
    }
    return data.sub;
}

function getJWT(req) {
    const jwt = req.headers[appConfig.jwtHeaderKey];
    if (!jwt) {
        throw new Error('Cannot retrieve jwt');
    }
    return jwt;
}

function decode(accessToken) {
    return jwt.decode(accessToken);
}

module.exports = {
    getReferrer: getReferrer,
    decode: decode,
    getJWT: getJWT
}