const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const targetConfig = require('./targetConfig.json');

const tempFilesDir = targetConfig.tempFilesDir; // Get the tempFilesDir from targetConfig
const assetsPath = path.join(tempFilesDir, 'assets.json');
const domainIdMappingsPath = path.join(tempFilesDir, 'domainIdMappings.json');

// Read and parse the JSON files
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
const domainIdMappings = JSON.parse(fs.readFileSync(domainIdMappingsPath, 'utf8'));

// Create an axios instance with the target API URL and credentials
const api = axios.create({
    baseURL: targetConfig.targetApiURL,
    auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
    }
});

// Function to split an array into chunks
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

// Split the assets array into chunks of 1000
const assetChunks = chunkArray(assets, 1000);

// Iterate through the chunks and issue a bulk POST request for each chunk
assetChunks.forEach(async (chunk, index) => {
    try {
        // Send a POST request to the assets/bulk endpoint
        const response = await api.post('/assets/bulk', chunk);

        console.log(`Batch ${index + 1} of assets created with status code ${response.status}`);
    } catch (error) {
        console.error(`Failed to create batch ${index + 1} of assets: ${error.message}`);
    }
});