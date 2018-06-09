const multer = require('multer');
const uuid = require('uuid');
const ApiError = require('../error/api-error');
var storage = multer.diskStorage({
    destination: `data/imageUploads`,
    filename: function (req, file, cb) {
        const mimeType = file.mimetype;
        const fileName = `${uuid.v4()}.${mimeType.substr(mimeType.lastIndexOf('/') + 1)}`;
        cb(null, fileName);
    }
})
const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const mimeType = file.mimetype;
        if (!mimeType.includes('image')) {
            return cb(new ApiError(`File type filtered out`, 400));
        }
        cb(null, true);
    }
});

module.exports = {
    upload
}
