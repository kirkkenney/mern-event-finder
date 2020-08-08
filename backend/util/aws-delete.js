const AWS = require('aws-sdk');

const deleteFromAWS = async (filePath) => {

    // filePath is the full URL of the image. In order to delete from AWS, we only need the filename - 2nd element here after splitting URL string after base URL path
    const fileName = filePath.split(`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];

    AWS.config.update({
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.AWS_REGION
    });

    const s3 = new AWS.S3();
    
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: fileName
    }
    try {
        // first check that the file exists in AWS bucket before attempting to delete it
        await s3.headObject(params).promise()
        try {
            await s3.deleteObject(params).promise()
        }
        catch (err) { }
    } catch (err) { }

}

module.exports = deleteFromAWS;
