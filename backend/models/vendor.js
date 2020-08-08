const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 7 },
    address: { type: String, required: true },
    postcode: { type: String, required: true },
    coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    photo: { type: String, required: true },
    events: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Event' }]
})

module.exports = mongoose.model('Vendor', vendorSchema);