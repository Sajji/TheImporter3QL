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

// Function to flatten the domain type hierarchy
const flattenDomainTypes = (domainType, flattened = new Set()) => {
  if (!domainType || flattened.has(domainType.id)) return;
  
  flattened.add(domainType.id);
  
  if (domainType.parent) {
    flattenDomainTypes(domainType.parent, flattened);
  }
  console.log([...flattened]);
  return [...flattened];
};

// Function to check if a domain type exists
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

// Function to add a new domain type
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
      break;
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
// Main function to process all domain types
const processDomainTypes = async () => {
  const domainTypesPath = path.join(targetConfig.backupDir, 'uniqueDomainTypesTree.json');
  const domainTypesData = JSON.parse(fs.readFileSync(domainTypesPath, 'utf8'));

  let allDomainTypeIds = new Set();
  for (const domainType of domainTypesData) {
    flattenDomainTypes(domainType, allDomainTypeIds);
  }

  for (const domainTypeId of allDomainTypeIds) {
    // Find the domain type object that corresponds to the current ID
    let domainType = findDomainTypeById(domainTypesData, domainTypeId);
    if (domainType) {
      const exists = await checkDomainTypeExists(domainTypeId);
      if (!exists) {
        const addResponse = await askQuestion(`Domain type ${domainType.name} does not exist. Do you want to add it? (yes/no) `);
        if (addResponse.toLowerCase() === 'yes') {
          await addDomainType(domainType);
        }
      } else {
        console.log(`Domain type ${domainType.name} already exists.`);
      }
    }
  }

  rl.close();
};

// Function to find a domain type by ID from the nested structure
const findDomainTypeById = (domainTypes, id) => {
  for (const domainType of domainTypes) {
    if (domainType.id === id) {
      return domainType;
    }
    if (domainType.parent) {
      let found = findDomainTypeById([domainType.parent], id);
      if (found) return found;
    }
  }
  return null;
};


processDomainTypes();
