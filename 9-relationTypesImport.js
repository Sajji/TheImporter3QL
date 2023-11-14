const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const targetConfig = require('./targetConfig.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query, defaultAnswer = 'yes') => new Promise((resolve) => {
  rl.question(query, (answer) => {
    resolve(answer || defaultAnswer);
  });
});

const addRelationType = async (relationType) => {
  try {
    const payload = {
      sourceTypeId: relationType.sourceTypeId,
      targetTypeId: relationType.targetTypeId,
      role: relationType.role,
      coRole: relationType.coRole
    };

    await axios.post(`https://${targetConfig.targetDomain}/rest/2.0/relationTypes`, payload, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
      }
    });
    console.log(`Relation type '${relationType.role} ${relationType.coRole}' added successfully.`);
  } catch (error) {
    console.error(`Error adding relation type:`, error.message);
  }
};

const processRelationTypes = async () => {
  const missingRelationTypesPath = path.join(targetConfig.tempFilesDir, 'missingRelationTypes.json');
  const missingRelationTypes = JSON.parse(fs.readFileSync(missingRelationTypesPath, 'utf8'));

  for (const relationType of missingRelationTypes) {
    const userResponse = await askQuestion(`Add relation type '${relationType.sourceTypeName} ${relationType.role} ${relationType.coRole} ${relationType.targetTypeName}'? (yes/no) `, 'yes');

    if (userResponse.toLowerCase() === 'yes') {
      await addRelationType(relationType);
    }
  }

  rl.close();
};

processRelationTypes();
