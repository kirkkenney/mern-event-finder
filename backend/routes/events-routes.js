const express = require('express');
const HttpError = require('../models/http-error');
const { check } = require('express-validator');
const eventsControllers = require('../controllers/events-controllers');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();


/////////////////////
// GET EVENTS LIST //
/////////////////////
router.get('/', eventsControllers.getEvents)


/////////////////////////
// GET TODAY'S EVENTS //
////////////////////////
router.get('/today', eventsControllers.getTodayEvents)


///////////////////////
// GET SINGLE EVENT //
//////////////////////
router.get('/:eid', eventsControllers.getEventById)


//////////////////
// CREATE EVENT //
//////////////////
router.post(
    '/',
    auth,
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('date').not().isEmpty(),
        check('time').not().isEmpty(),
    ],
    eventsControllers.createEvent
)


///////////////////
// UPDATE EVENT //
//////////////////
router.patch(
    '/:eid', 
    auth,
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('date').not().isEmpty(),
        check('time').not().isEmpty(),
    ],
    eventsControllers.updateEvent
)


///////////////////
// DELETE EVENT //
//////////////////
router.delete('/:eid', auth, eventsControllers.deleteEvent)

module.exports = router;