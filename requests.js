// requests.js
const axios = require('axios');
const targetConfig = require('./targetConfig.json');

// Helper function to handle requests
const handleRequest = async (method, endpoint, payload) => {
    try {
        const url = `${targetConfig.targetApiURL}/${endpoint}`;
        const options = {
            method: method,
            url: url,
            auth: {
                username: targetConfig.targetUsername,
                password: targetConfig.targetPassword,
            },
            data: payload
        };

        const response = await axios(options);
        return { data: response.data, status: response.status };
    } catch (error) {
        if (error.response) {
            // Return detailed error information
            return { error: true, status: error.response.status, message: error.message, data: error.response.data };
        }
        throw error; // Other errors
    }
};

const singlePost = (endpoint, payload) => handleRequest('post', endpoint, payload);
const singlePatch = (endpoint, payload) => handleRequest('patch', endpoint, payload);
const bulkPost = (endpoint, payloads) => Promise.all(payloads.map(payload => handleRequest('post', endpoint, payload)));
const bulkPatch = (endpoint, payloads) => Promise.all(payloads.map(payload => handleRequest('patch', endpoint, payload)));

module.exports = { singlePost, singlePatch, bulkPost, bulkPatch };
