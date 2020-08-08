const HttpError = require('../models/http-error');
const Vendor = require('../models/vendor');
const Event = require('../models/event');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const mongoose = require('mongoose');
const calcDistanceBetweenCoords = require('../util/calc-distance');
const deleteFromAWS = require('../util/aws-delete');


///////////////////
// CREATE EVENT //
//////////////////
const createEvent = async (req, res, next) => {
    // errors defined and extracted by 'express'validator' middleware on the route definition
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid information submitted. Please double-check and try again.', 422))
    }
    const { title, description, address, postcode, date, time } = req.body;
    let vendor;
    try {
        vendor = await Vendor.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Something went wrong! Unable to create event. Please try again later.', 500))
    }
    if (!vendor) {
        return next(new HttpError('Unable to find a vendor with that id.', 404))
    }
    // check that an address & postcode have been passed from the front-end. If they have, then coordinates are obtained using getCoordsForAddress util function. If not, set coordinates to null so that address can be obtained from Vendor data on front-end. Null is passed instead of Vendor data here so that if Vendor data changes in the future (eg change of address), the Event data will not become incorrect
    let coordinates;
    if (address.length === 0 || postcode.length === 0) {
        coordinates = null;
    } else {
        try {
            coordinates = await getCoordsForAddress(`${address}${postcode.replace(/\s/g, "")}`)
        } catch (err) {
            return next(new HttpError('Something went wrong! Unable to create event. Please try again later.', 500))
        }
    }

    const newEvent = new Event({
        title,
        description: description ? description : '',
        // check that an address & postcode have been passed from the front-end. If not, set them to null so that details can be obtained from Vendor data on front-end. Null is passed instead of Vendor data here so that if Vendor data changes in the future (eg change of address), the Event data will not become incorrect
        address: address.length === 0 ? null : address,
        postcode: postcode.length === 0 ? null : postcode,
        coords: coordinates,
        date: new Date(`${date} GMT`),
        time,
        // if a file has not been upload, set to null so that photo can be obtained from Vendor data on the front-end. Reasoning same as address and postcode above. "Location" property is appended to req.file by the fileUpload middleware which calls AWS S3 storage SDK
        photo: req.file ? req.file.Location : null,
        vendor: req.userData.userId
    });
    try {
        // below syntax ensures that all Mongoose operations complete successfully before writing to database. Prevents edge cases where eg a new Event is successfully created, but then fails pushing the reference to Vendor
        const session = await mongoose.startSession();
        session.startTransaction();
        await newEvent.save({ session: session });
        vendor.events.push(newEvent);
        await vendor.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        return next(new HttpError('Something went wrong! Unable to create event. Please try again later.', 500))
    }
    res.status(201).json({
        event: newEvent
    })
}


///////////////////////
// GET SINGLE EVENT //
//////////////////////
const getEventById = async (req, res, next) => {
    const eid = req.params.eid;
    let event;
    try {
        event = await Event.findById(eid).populate('vendor');
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if(!event) {
        return next(new HttpError('Could not find an event with that id. Please try again.', 404))
    }
    res.status(200).json({
        event: event.toObject({ getters: true })
    })
}


/////////////////////////
// GET TODAY'S EVENTS //
////////////////////////
const getTodayEvents = async (req, res, next) => {
    const date = new Date();
    // without the 'GMT' declaration, the date object returned is 23:00 on previous day
    const today = new Date(`${date.toDateString()} GMT`);
    let events;
    try {
        events = await Event.find({ date: { $eq: today } }).populate('vendor', '-password')
    } catch (err) {
        return next(new HttpError('Could not find any events for today.', 404))
    }
    return res.status(200).json({
        events
    })
}


/////////////////////
// GET EVENT LIST //
////////////////////
const getEvents = async (req, res, next) => {
    const { postcode, distance, date } = req.query;
    if (!postcode || !distance || !date) {
        return next(new HttpError('Your postcode, a date and a desired distance must be provided.', 422))
    }
    let dateQuery = new Date(`${date} GMT`);
    let postcodeCoords;
    let events;
    try {
        // get coordinates for postcode using getCoordsForAddress util function, stripping out any whitespace
        postcodeCoords = await getCoordsForAddress(postcode.replace(/\s/g, ""));
    } catch (err) {
        return next(new HttpError(err, 422))
    }
    try {
        events = await Event.find({ date: { $eq: dateQuery } }).populate('vendor', '-password');
    } catch (err) {
        return next(new HttpError('Could not load events. Please try again later', 500))
    }
    const getEventsFilteredByDistance = async () => {
        let newEvents = [];
        events.forEach(async event => {
            // if the Event coordinates are set to null, then coords should instead be obtained from the Vendor details
            const coords = event.coords.length > 0 ? event.coords : event.vendor.coords;
            // calcDistanceBetweenCoords util function calculates and returns distance "as the crow flies" between 2 locations: each with lat and lng properties
            const calculatedDistance = calcDistanceBetweenCoords(coords.lat, coords.lng, postcodeCoords.lat, postcodeCoords.lng);
            // if the returned distance is greater than that passed by the user, ignore and continue
            if (calculatedDistance > distance) {
                return
            } else {
                newEvents.push({
                    ...event._doc,
                    distance: calculatedDistance
                })
            }
        })
        return newEvents;
    }
    const eventsFilteredByDistance = await getEventsFilteredByDistance();
    res.status(200).json({
        events: eventsFilteredByDistance
    })
}


///////////////////
// UPDATE EVENT //
//////////////////
const updateEvent = async (req, res, next) => {
    const eid = req.params.eid;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid information submitted. Please double-check and try again.', 422))
    }
    const { title, description, address, postcode, date, time } = req.body;
    let event;
    try {
        event = await Event.findById(eid);
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if (!event) {
        return next(new HttpError('Unable to find an event with that id. Please double-check and try again.', 404))
    }
    if (event.vendor.toString() !== req.userData.userId) {
        return next(new HttpError("You cannot edit another vendor's events!", 401))
    }
    // check that an address & postcode have been passed from the front-end. If they have, then coordinates are obtained using getCoordsForAddress util function. If not, set coordinates to null so that address can be obtained from Vendor data on front-end. Null is passed instead of Vendor data here so that if Vendor data changes in the future (eg change of address), the Event data will not become incorrect
    let coordinates;
    if (address.length === 0 || postcode.length === 0) {
        coordinates = null;
    // If address and postcode have been passed by the user, check that they are different than what is currently stored. If so, get new coordinates
    } else if (address.length > 0 && (address !== event.address || postcode.replace(/\s/g, "").toLowerCase() !== event.postcode)) {
        try {
            coordinates = await getCoordsForAddress(`${address}${postcode.replace(/\s/g, "")}`);
        } catch (err) {
            return next(err)
        }
    } else {
        coordinates = event.coords;
    }

    // get the currently stored Event photo as a reference so that it can be passed to deleteFromAWS util function if photo has changed
    const currentPhoto = event.photo;

    event.title = title;
    event.description = description;
    event.address = address.length === 0 ? null : address;
    event.postcode = postcode.length === 0 ? null : address;
    event.coords = coordinates;
    event.date = new Date(`${date} GMT`);
    event.time = time;
    event.photo = req.file ? req.file.Location : currentPhoto;
    try {
        await event.save();
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    // if user has uploaded a new Event photo, delete the current photo using deleteFromAWS util function
    if (req.file) {
        try {
            deleteFromAWS(currentPhoto)
        } catch (err) {}
    }
    res.status(200).json({
        event: event.toObject({ getters: true })
    })
}


///////////////////
// DELETE EVENT //
//////////////////
const deleteEvent = async (req, res, next) => {
    const eid = req.params.eid;
    let event;
    try {
        event = await Event.findById(eid).populate('vendor');
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    if (!event) {
        return next(new HttpError('Could not find an event with that id. Please double-check and try again.', 404))
    }
    if (event.vendor.id !== req.userData.userId) {
        return next(new HttpError("You are not allowed to delete another vendor's events!", 401))
    }
    
    // get the currently stored Event photo as a reference so that it can be passed to deleteFromAWS util function if photo has changed
    const currentPhoto = event.photo;

    try {
        // below syntax ensures that all Mongoose operations complete successfully before writing to database. Prevents edge cases where eg a new Event is successfully created, but then fails pushing the reference to Vendor
        const session = await mongoose.startSession();
        session.startTransaction();
        await event.remove({ session: session });
        event.vendor.events.pull(event);
        await event.vendor.save();
        await session.commitTransaction();
        deleteFromAWS(currentPhoto)
    } catch (err) {
        return next(new HttpError('Something went wrong! Please try again later.', 500))
    }
    res.status(200).json({
        message: 'Event deleted successfully.'
    })
}


exports.createEvent = createEvent;
exports.getEventById = getEventById;
exports.getEvents = getEvents;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.getTodayEvents = getTodayEvents;