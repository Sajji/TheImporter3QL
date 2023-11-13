const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const configManager = require('./configManager'); // Assuming configManager is correctly set up

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask question using readline
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to check if a domain type exists in the target system
const checkDomainTypeExists = async (domainTypeId, targetConfig) => {
  const url = `https://${targetConfig.targetDomain}/rest/2.0/domainTypes/${domainTypeId}`;
  try {
    const response = await axios.get(url, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword,
      },
    });
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // Not found
    }
    throw error; // Other errors
  }
};

// Function to add a new domain type to the target system
const addDomainType = async (domainType, targetConfig) => {
  const url = `https://${targetConfig.targetDomain}/rest/2.0/domainTypes`;
  const payload = {
    id: domainType.id,
    name: domainType.newName, // Assuming newName is what you want to use
    description: domainType.description,
    parentId: domainType.parentId,
  };

  try {
    const response = await axios.post(url, payload, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword,
      },
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error(`Error adding domain type ${domainType.id}:`, error.message);
    return false;
  }
};

// Main function to process domain types
const processDomainTypes = async () => {
    const backupDir = configManager.getBackupDir();
    console.log(`Using backup directory: ${backupDir}`);
    const targetConfig = configManager.getTargetConfig();
    const domainTypesFilePath = path.join(backupDir, 'uniqueDomainTypesTree.json');
  
    if (!fs.existsSync(domainTypesFilePath)) {
      console.error('uniqueDomainTypesTree.json not found in the backup directory.');
      return;
    }
  
    const domainTypes = JSON.parse(fs.readFileSync(domainTypesFilePath, 'utf8'));
  
  const domainTypesPath = path.join(backupDir, 'uniqueDomainTypesTree.json');

  for (const domainType of domainTypes) {
    const exists = await checkDomainTypeExists(domainType.id, targetConfig);
    if (!exists) {
      const addResponse = await askQuestion(`Domain type ${domainType.name} does not exist. Do you want to add it? (yes/no) `);
      if (addResponse.toLowerCase() === 'yes') {
        const success = await addDomainType(domainType, targetConfig);
        if (success) {
          console.log(`Domain type ${domainType.name} added successfully.`);
        }
      }
    } else {
      console.log(`Domain type ${domainType.name} already exists.`);
    }
  }

  rl.close();
};

processDomainTypes();
