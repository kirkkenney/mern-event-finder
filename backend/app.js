const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
const deleteFromAWS = require('./util/aws-delete');

const eventsRoutes = require('./routes/events-routes');
const vendorsRoutes = require('./routes/vendors-routes');

const app = express();

app.use(bodyParser.json());

// Below required for CORS configuration. Backend and Frontend of this app are hosted separately, so this is required for communication between the two
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use('/api/events', eventsRoutes);
app.use('/api/vendors', vendorsRoutes);

// If requested route does not exist in above, return a 404 response
app.use((req, res, next) => {
    const error = new HttpError('Could not find the requested resource', 404);
    return next(error);
});

// Intercept HTTP/Server and return error data to user
app.use((error, req, res, next) => {
    // if there is a file attached to the request with an error response, delete file from AWS
    if (req.file) {
        try {
            deleteFromAWS(req.file.Location)
        } catch (err) { }
    }
    if (res.headersSent) {
        return next(error);
    }

    // had an issue where file management errors were returning non-integer error codes, so below checks that error code is a valid, standard error code and returns accordingly, otherwise defaults to 500
    res.status(error.code >= 100 && error.code < 600 ? error.code : 500)
    // return HTTP error message passed, or default
    .json({
        message: error.message || 'An unknown error occurred! Please try again later.'
    })
});

mongoose
.connect(
    `mongodb+srv://kirk:${process.env.DB_PASS}@cluster0.re7oy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, 
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log('Server listening')
    })
})
.catch(err => {
    console.log(err);
})
