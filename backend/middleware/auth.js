const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (!req.method === 'OPTIONS') {
        return next()
    }
    try {
        // Authorization header = "Bearer {token}". Split the Authorization hheader string to only extract the token portion
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return next(new HttpError('Authentication failed', 401))
        }
        // Verify the token then extract userId from it and append to request body
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId };
        next()
    } catch (err) {
        return next(new HttpError('Authentication failed', 401))
    }
}