const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readlineSync = require('readline-sync');
const targetConfig = require('./targetConfig.json');

const tempFilesDir = targetConfig.tempFilesDir; // Get the tempFilesDir from targetConfig
const domainsPath = path.join(tempFilesDir, 'domains.json');

// Read and parse the JSON file
const domains = JSON.parse(fs.readFileSync(domainsPath, 'utf8'));

// Prompt the user for a suffix
const suffix = readlineSync.question('Please enter a suffix to make domain names unique: ');

// Create an axios instance with the target API URL and credentials
const api = axios.create({
    baseURL: targetConfig.targetApiURL,
    auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
    }
});

// Iterate through the domains array and issue a POST request for each domain
domains.forEach(async domain => {
    try {
        // Modify the name key to keep it unique
        domain.name += suffix;

        // Send a POST request to the domains endpoint
        const response = await api.post('/domains', domain);

        console.log(`Domain ${domain.name} created with status code ${response.status}`);
    } catch (error) {
        console.error(`Failed to create domain ${domain.name}: ${error.message}`);
    }
});