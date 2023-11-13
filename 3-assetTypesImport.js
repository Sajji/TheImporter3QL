const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const targetConfig = require('./targetConfig.json'); // Assuming this file has the necessary target system configuration

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Recursive function to process asset type and its parents
const processAssetType = async (assetType) => {
  if (!assetType || assetType.parentId === "00000000-0000-0000-0000-000000031000") { // Assuming this is the top-level parent ID for asset types
    return; // Base case: reached top-level parent or no more parents
  }

  const exists = await checkAssetTypeExists(assetType.id);
  if (!exists) {
    const addResponse = await askQuestion(`Asset type ${assetType.name} does not exist. Do you want to add it? (yes/no) `);
    if (addResponse.toLowerCase() === 'yes') {
      await addAssetType(assetType);
    }
  } else {
    console.log(`Asset type ${assetType.name} already exists.`);
  }

  // Process the parent asset type
  await processAssetType(assetType.parent);
};

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

const addAssetType = async (assetType) => {
  while (true) {
    try {
      await axios.post(`https://${targetConfig.targetDomain}/rest/2.0/assetTypes`, {
        id: assetType.id,
        name: assetType.newName, // Assuming newName is what you want to use
        description: assetType.description,
        parentId: assetType.parentId
      }, {
        auth: {
          username: targetConfig.targetUsername,
          password: targetConfig.targetPassword
        }
      });
      console.log(`Asset type ${assetType.newName} added successfully.`);
      return;
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
const processAssetTypes = async () => {
  const assetTypesPath = path.join(targetConfig.backupDir, 'uniqueAssetTypesTree.json');
  const assetTypes = JSON.parse(fs.readFileSync(assetTypesPath, 'utf8'));

  for (const assetType of assetTypes) {
    await processAssetType(assetType);
  }

  rl.close();
};

processAssetTypes();
