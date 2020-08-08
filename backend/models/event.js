const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    photo: { type: String },
    address: { type: String },
    postcode: { type: String },
    coords: {
        lat: { type: Number },
        lng: { type: Number }
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    vendor: { type: mongoose.Types.ObjectId, required: true, ref: 'Vendor' }
})

module.exports = mongoose.model('Event', eventSchema);