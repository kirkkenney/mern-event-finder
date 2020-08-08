const crypto = require('crypto');

// this function is used as an NPM script only - will generate a random string for use as unique keys eg JSONWebToken access key
function generateToken() {
    crypto.randomBytes(48, (err, buffer) => {
        const token = buffer.toString('hex');
    })
}

generateToken();