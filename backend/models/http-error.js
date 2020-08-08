// creates a new HttpError class to be used throughout the application for custom HTTP error messages
class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.code = errorCode;
    }
}

module.exports = HttpError;