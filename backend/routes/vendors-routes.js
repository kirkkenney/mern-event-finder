const express = require('express');
const { check } = require('express-validator');
const vendorControllers = require('../controllers/vendors-controllers');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();


////////////////
// GET VENDOR //
////////////////
router.get('/:vid/:timeRef', vendorControllers.getVendorById)


///////////////////
// VENDOR SIGNUP//
//////////////////
router.post(
    '/', 
    fileUpload.single('image'),
    [
        check('vendor').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('address').not().isEmpty(),
        check('postcode').not().isEmpty(),
        check('password').isLength({min: 7})
    ],
    vendorControllers.vendorSignup
);


///////////////////
// VENDOR LOGIN //
//////////////////
router.post('/login', vendorControllers.vendorLogin)


///////////////////
// UPDATE VENDOR //
///////////////////
router.patch(
    '/:vid',
    fileUpload.single('image'), 
    auth,
    [
        check('vendor').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('address').not().isEmpty(),
        check('postcode').not().isEmpty()
    ],
    vendorControllers.updateVendor
);

module.exports = router;