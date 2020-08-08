const multer = require('multer');
const s3Storage = require('multer-sharp-s3');
const aws = require('aws-sdk');

// used to extract correct mime type from uploaded file
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_KEY_ID,
    region: process.env.AWS_REGION
})

const s3 = new aws.S3();

const storage = s3Storage({
    s3,
    Bucket: process.env.AWS_BUCKET,
    // Key is the filename. I'm using a date object here for uniqueness. As this is a small application, the chances of 2 files being uploaded at exactly the same time is neglible. This could easily be re-factored to introduce an extra degree of uniqueness (eg prepend a random number between 1-100 or use the uuid library to generate a random string)
    Key: (req, file, cb) => {
        const ext = MIME_TYPE_MAP[file.mimetype];
        // first argument of callback is an error handler, 2nd is filename assignment
        cb(null, `${new Date().getTime()}.${ext}`)
    },
    resize: {
        width: 500,
        height: 500
    }
  })

  // this function is what is executed directly as middleware. We simply use multer library to handle the file processing, appending properties to request body etc
const fileUpload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // double-bang operator ('!!') converts undefined or null to false, and a matching result to true
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error('That does not look like a valid image')
        cb(error, isValid)
    }
})

module.exports = fileUpload