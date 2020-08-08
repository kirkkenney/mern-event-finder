const HttpError = require('../models/http-error');
const Vendor = require('../models/vendor');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const jwt = require('jsonwebtoken');
const Event = require('../models/event');
const deleteFromAWS = require('../util/aws-delete');


///////////////////
// VENDOR SIGNUP//
//////////////////
const vendorSignup = async (req, res, next) => {
    // check that POST data passed the middleware validation checks, and return an error if not
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed. Please check all required information has been submitted', 500))
    }

    const { vendor, email, password, address, postcode} = req.body;
    // check to see if email in POST data is already in use and return an error if this is the case
    let vendorExists;
    try {
        vendorExists = await Vendor.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    if (vendorExists) {
        return next(new HttpError('That email address is already in use. Please use a different one.', 422));
    }
    // hash the password submitted by the user
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    // get coordinates from the address provided by user, by passing the address to the getCoordsForAddress util function
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(`${address}${postcode.replace(/\s/g, "")}`);
    } catch (err) {
        return next(err)
    }
    const newVendor = new Vendor({
        name: vendor.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        postcode: postcode.replace(/\s/g, "").toUpperCase(),
        coords: coordinates,
        photo: req.file.Location,
        events: []
    });
    try {
        newVendor.save();
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    // JSONWebToken is generated and passed back to user for front-end Authentication
    let token;
    try {
        token = jwt.sign(
            { userId: newVendor.id, email: newVendor.email },
            process.env.JWT_KEY,
            { expiresIn: '2hr' }
        )
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    res.status(201).json({
        userId: newVendor.id,
        email: newVendor.email,
        address: newVendor.address,
        postcode: newVendor.postcode,
        photo: newVendor.photo,
        coords: newVendor.coords,
        token: token
    })
};


///////////////////
// VENDOR LOGIN //
//////////////////
const vendorLogin = async (req, res, next) => {
    const { email, password } = req.body;
    let vendorExists;
    try {
        vendorExists = await Vendor.findOne({ email: email })
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    if (!vendorExists) {
        return next(new HttpError('Could not login with those details. Please double-check and try again.', 401))
    }
    let isValidPassword = false;
    try {
        // compare the password passed by user with hashed password stored against user data
        isValidPassword = await bcrypt.compare(password, vendorExists.password)
    } catch (err) {
        return next(new HttpError('Could not login with those details. Please double-check and try again.', 401))
    }
    if (!isValidPassword) {
        return next(new HttpError('Could not login with those details. Please double-check and try again.', 401))
    }
    // JSONWebToken is generated and passed back to user for front-end Authentication
    let token;
    try {
        token = jwt.sign(
            { userId: vendorExists.id, email: vendorExists.email },
            process.env.JWT_KEY,
            { expiresIn: '2hr' }
        )
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later', 500))
    }
    res.status(200).json({
        userId: vendorExists.id,
        email: vendorExists.email,
        address: vendorExists.address,
        postcode: vendorExists.postcode,
        photo: vendorExists.photo,
        coords: vendorExists.coords,
        token: token
    })
}


////////////////
// GET VENDOR //
////////////////
const getVendorById = async (req, res, next) => {
    const vid = req.params.vid;
    // timeRef used to determine if current and future Events should be returned, or past events
    const timeRef = req.params.timeRef;
    const current = new Date(`${new Date().toDateString()} GMT`);
    let vendor;
    try {
        vendor = await Vendor.findById(vid, '-password');
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if (!vendor) {
        return next(new HttpError('Could not find a vendor with that id. Please try again.', 404))
    }
    let events;
    try {
        if (timeRef === 'past') {
            events = await Event.find({ vendor: vid, date: { $lt: current } }).sort({ date: -1 })
        } else {
            events = await Event.find({ vendor: vid, date: { $gte: current } }).sort({ date: 1 })
        }
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    res.status(200).json({
        vendor: vendor.toObject({ getters: true }),
        events: events.map(event => event.toObject({ getters: true }))
    })
}


///////////////////
// UPDATE VENDOR //
///////////////////
const updateVendor = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid information passed. Please double-check and try again.', 422))
    }
    const vid = req.params.vid;
    const { vendor, email, address, postcode } = req.body;
    let vendorExists;
    try {
        vendorExists = await Vendor.findById(vid, '-password');
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if (!vendorExists) {
        return next(new HttpError('Could not find a vendor with that id. Please try again.', 404))
    }
    if (req.userData.userId !== vendorExists.id.toString()) {
        return next(new HttpError('You do not have permission to do that!', 401))
    }
    // if address or postcode has been updated, get new coordinates from getCoordsForAddress util function
    let coordinates;
    if (address !== vendorExists.address || postcode.replace(/\s/g, "").toUpperCase() !== vendorExists.postcode.toUpperCase()) {
        try {
            coordinates = await getCoordsForAddress(`${address}${postcode.replace(/\s/g, "")}`);
        } catch (err) {
            return next(err)
        }
    } else {
        coordinates = vendorExists.coords;
    }

    // get the currently stored Vendor photo as a reference so that it can be passed to deleteFromAWS util function if photo has changed
    const currentPhoto = vendorExists.photo;

    vendorExists.name = vendor.trim();
    vendorExists.email = email.trim().toLowerCase();
    vendorExists.address = address.trim();
    vendorExists.postcode = postcode.replace(/\s/g, "").toUpperCase();
    vendorExists.photo = req.file ? req.file.Location : currentPhoto;
    vendorExists.coords = coordinates;
    try {
        await vendorExists.save();
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if (req.file) {
        try {
            deleteFromAWS(currentPhoto)
        } catch (err) {}
    }
    res.status(200).json({
        vendor: vendorExists.toObject({ getters: true })
    })
}



exports.vendorSignup = vendorSignup;
exports.vendorLogin = vendorLogin;
exports.getVendorById = getVendorById;
exports.updateVendor = updateVendor;