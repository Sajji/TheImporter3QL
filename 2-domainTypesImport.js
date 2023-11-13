const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const targetConfig = require('./targetConfig.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Recursive function to process domain type and its parents
const processDomainType = async (domainType) => {
  if (!domainType || domainType.parentId === "00000000-0000-0000-0000-000000003007") {
    return; // Base case: reached top-level parent or no more parents
  }

  const exists = await checkDomainTypeExists(domainType.id);
  if (!exists) {
    const addResponse = await askQuestion(`Domain type ${domainType.name} does not exist. Do you want to add it? (yes/no) `);
    if (addResponse.toLowerCase() === 'yes') {
      await addDomainType(domainType);
    }
  } else {
    console.log(`Domain type ${domainType.name} already exists.`);
  }

  // Process the parent domain type
  await processDomainType(domainType.parent);
};

const checkDomainTypeExists = async (domainTypeId) => {
  try {
    await axios.get(`https://${targetConfig.targetDomain}/rest/2.0/domainTypes/${domainTypeId}`, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
      }
    });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // Not found
    }
    throw error;
  }
};

const addDomainType = async (domainType) => {
  while (true) {
    try {
      await axios.post(`https://${targetConfig.targetDomain}/rest/2.0/domainTypes`, {
        id: domainType.id,
        name: domainType.newName,
        description: domainType.description,
        parentId: domainType.parentId
      }, {
        auth: {
          username: targetConfig.targetUsername,
          password: targetConfig.targetPassword
        }
      });
      console.log(`Domain type ${domainType.newName} added successfully.`);
      return;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`Domain type ${domainType.newName} already exists. Please provide a new name.`);
        domainType.newName = await askQuestion('Enter new domain type name: ');
      } else {
        throw error;
      }
    }
  }
};

// Main function to process domain types
const processDomainTypes = async () => {
  const domainTypesPath = path.join(targetConfig.backupDir, 'uniqueDomainTypesTree.json');
  const domainTypes = JSON.parse(fs.readFileSync(domainTypesPath, 'utf8'));

  for (const domainType of domainTypes) {
    await processDomainType(domainType);
  }

  rl.close();
};

processDomainTypes();
