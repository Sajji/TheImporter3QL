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

// Function to flatten the asset type hierarchy
const flattenAssetTypes = (assetType, flattened = new Set()) => {
  if (!assetType || flattened.has(assetType.id)) return;
  
  flattened.add(assetType.id);
  
  if (assetType.parent) {
    flattenAssetTypes(assetType.parent, flattened);
  }
  console.log([...flattened]);
  return [...flattened];
};

// Function to check if a asset type exists
const checkAssetTypeExists = async (assetTypeId) => {
  try {
    await axios.get(`https://${targetConfig.targetDomain}/rest/2.0/assetTypes/${assetTypeId}`, {
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

// Function to add a new asset type
const addAssetType = async (assetType) => {
  while (true) {
    try {
      await axios.post(`https://${targetConfig.targetDomain}/rest/2.0/assetTypes`, {
        id: assetType.id,
        name: assetType.newName,
        description: assetType.description,
        parentId: assetType.parentId
      }, {
        auth: {
          username: targetConfig.targetUsername,
          password: targetConfig.targetPassword
        }
      });
      console.log(`Asset type ${assetType.newName} added successfully.`);
      break;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`Asset type ${assetType.newName} already exists. Please provide a new name.`);
        assetType.newName = await askQuestion('Enter new asset type name: ');
      } else {
        throw error;
      }
    }
  }
};

// Main function to process asset types
// Main function to process all asset types
const processAssetTypes = async () => {
  const assetTypesPath = path.join(targetConfig.backupDir, 'uniqueAssetTypesTree.json');
  const assetTypesData = JSON.parse(fs.readFileSync(assetTypesPath, 'utf8'));

  let allAssetTypeIds = new Set();
  for (const assetType of assetTypesData) {
    flattenAssetTypes(assetType, allAssetTypeIds);
  }

  for (const assetTypeId of allAssetTypeIds) {
    // Find the asset type object that corresponds to the current ID
    let assetType = findAssetTypeById(assetTypesData, assetTypeId);
    if (assetType) {
      console.log(`Processing asset type ${assetTypeId}`)
      const exists = await checkAssetTypeExists(assetTypeId);
      if (!exists) {
        const addResponse = await askQuestion(`Asset type ${assetType.name} does not exist. Do you want to add it? (yes/no) `);
        if (addResponse.toLowerCase() === 'yes') {
          await addAssetType(assetType);
        }
      } else {
        console.log(`Asset type ${assetType.name} already exists.`);
      }
    }
  }

  rl.close();
};

// Function to find a asset type by ID from the nested structure
const findAssetTypeById = (assetTypes, id) => {
  for (const assetType of assetTypes) {
    if (assetType.id === id) {
      return assetType;
    }
    if (assetType.parent) {
      let found = findAssetTypeById([assetType.parent], id);
      if (found) return found;
    }
  }
  return null;
};


processAssetTypes();
