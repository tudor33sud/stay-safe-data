const jwt = require('jsonwebtoken');
const appConfig = require('../config');

function getReferrer(req) {
    const accessToken = getJWT(req);
    if(!accessToken){
        return;
    }
    const data = jwt.decode(accessToken);
    return data.sub;
}

function getJWT(req) {
    const jwt = req.headers[appConfig.jwtHeaderKey];
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