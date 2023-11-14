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

// Function to check if an attribute type exists
const checkAttributeTypeExists = async (attributeTypeId) => {
  try {
    await axios.get(`https://${targetConfig.targetDomain}/rest/2.0/attributeTypes/${attributeTypeId}`, {
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

// Function to add a new attribute type
const addAttributeType = async (attributeType) => {
  try {
    await axios.post(`https://${targetConfig.targetDomain}/rest/2.0/attributeTypes`, attributeType, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
      }
    });
    console.log(`Attribute type ${attributeType.name} added successfully.`);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`Attribute type ${attributeType.name} already exists. Please provide a new name.`);
      attributeType.name = await askQuestion('Enter new attribute type name: ');
      await addAttributeType(attributeType); // Recursive call with updated name
    } else {
      throw error;
    }
  }
};

// Main function to process attribute types
// Function to process attribute types
const processAttributeTypes = async () => {
    const matchedAttributeTypesPath = path.join(targetConfig.tempFilesDir, 'matchedAttributeTypes.json');
    const matchedAttributeTypes = JSON.parse(fs.readFileSync(matchedAttributeTypesPath, 'utf8'));

    for (const attributeType of matchedAttributeTypes) {
        const exists = await checkAttributeTypeExists(attributeType.id);
        if (exists) {
            console.log(`Attribute type ${attributeType.name} already exists.`);
            continue;
        }

        const addResponse = await askQuestion(`Attribute type ${attributeType.name} does not exist. Do you want to add it? (yes/no) `);
        if (addResponse.toLowerCase() === 'yes') {
            await addAttributeType(attributeType);
        }
    }

    rl.close();
};

processAttributeTypes();
