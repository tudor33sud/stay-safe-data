const multer = require('multer');
const uuid = require('uuid');
var storage = multer.diskStorage({
    destination: `data/imageUploads`,
    filename: function (req, file, cb) {
        const mimeType = file.mimetype;
        if (mimeType.includes('image')) {
            const fileName = `${uuid.v4()}.${mimeType.substr(mimeType.lastIndexOf('/')+1)}`;
            cb(null, fileName);
        }

    }
})
const upload = multer({
    storage
});

module.exports = {
    upload
}
