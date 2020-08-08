const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = process.env.MAP_API_KEY

// passes an address string to Google Geocoding API in order to get coordinates, so that we can elsewhere add a marker to Google Maps API for Vendor/Event, and measure the distance between 2 points:
// - location of user
// - location of Event/Vendor
const getCoordsForAddress = async (address) => {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find location for the specified address. Please double-check and try again.', 422);
        throw error;
    }

    // extract coordinates from API response object
    const coordinates = data.results[0].geometry.location;

    return coordinates;
};

module.exports = getCoordsForAddress;