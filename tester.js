const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
const targetConfigPath = path.join(__dirname, 'targetConfig.json');

const testConnectivity = async (domain, username, password) => {
    try {
        const response = await axios.post(`https://${domain}/rest/2.0/auth/sessions`, { username, password });
        return response.status === 200;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        return false;
    }
};

const verifyTargetConfig = async () => {
    let useExistingConfig = false;
    if (fs.existsSync(targetConfigPath)) {
        const useExisting = await askQuestion('targetConfig.json already exists. Do you want to use it? (yes/no) ');
        useExistingConfig = useExisting.toLowerCase() === 'yes';
    }

    if (!useExistingConfig) {
        const targetDomain = await askQuestion('Enter the target domain: ');

        let isConnected = false;
        let attempts = 0;
        while (!isConnected && attempts < 3) {
            const targetUsername = await askQuestion('Enter the target username: ');
            const targetPassword = await askQuestion('Enter the target password: ', { hideEchoBack: true });

            isConnected = await testConnectivity(targetDomain, targetUsername, targetPassword);
            if (!isConnected) {
                console.error('Failed to connect to the target system. Please try again.');
                attempts++;
            }
        }

        if (!isConnected) {
            console.error('Failed to authenticate after 3 attempts. Exiting.');
            rl.close();
            return;
        }

        const backupDir = await askQuestion('Enter the path to the backup (extractedData) directory: ');
        if (!fs.existsSync(backupDir)) {
            console.error('Backup directory not found.');
            rl.close();
            return;
        }

        const tempFilesDir = path.join(__dirname, 'tempFilesDir');
        if (fs.existsSync(tempFilesDir)) {
            fs.rmSync(tempFilesDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempFilesDir);

        // Rest of the logic to create/update targetConfig.json
        // ...

    } else {
        console.log('Using existing targetConfig.json.');
    }

    rl.close();
};

verifyTargetConfig();
