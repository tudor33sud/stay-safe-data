const _ = require('lodash');

//================== Custom Validator Functions ============
function isObject(param) {
    if (_.isEmpty(param) || _.isArray(param)) {
        return false;
    }

    return true;
}

function isUrl(urlString) {
    var pattern = new RegExp('^(https:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(urlString);

}

function isArrayOfIntegers(param) {
    return !param.some(isNaN);
}

function isKeyValueObject(param) {
    if (!isObject) {
        return false;
    }
    return _.values(param).some(value => {
        return typeof value !== 'string'
    });
}
//================================================END

module.exports = {
    validators: {
        isUrl: isUrl,
        isArrayOfIntegers,
        isKeyValueObject
    }
};