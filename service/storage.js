const multer = require('multer');
const uuid = require('uuid');
const ApiError = require('../error/api-error');
var storage = multer.diskStorage({
    destination: `data/imageUploads`,
    filename: function (req, file, cb) {
        const mimeType = file.mimetype;
        if (mimeType.includes('image')) {
            const fileName = `${uuid.v4()}.${mimeType.substr(mimeType.lastIndexOf('/') + 1)}`;
            cb(null, fileName);
        } else {
            cb(new ApiError('File type not supported', 400));
        }

    }
})
const upload = multer({
    storage
});

module.exports = {
    upload
}
