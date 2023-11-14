const fs = require('fs');
const path = require('path');
const targetConfig = require('./targetConfig.json'); // Assuming this has the paths for backupDir and tempFilesDir

const attributeTypesPath = path.join(targetConfig.backupDir, 'attributeTypes.json');
const uniqueAttributeTypesPath = path.join(targetConfig.backupDir, 'uniqueAttributeTypes.json');
const outputFilePath = path.join(targetConfig.tempFilesDir, 'matchedAttributeTypes.json');

const attributeTypes = JSON.parse(fs.readFileSync(attributeTypesPath, 'utf8'));
const uniqueAttributeTypes = JSON.parse(fs.readFileSync(uniqueAttributeTypesPath, 'utf8'));

// Creating a Set for faster lookup
const uniqueTypeIds = new Set(uniqueAttributeTypes.map(type => type.typeId));

// Filtering and creating new array
const matchedAttributeTypes = attributeTypes.filter(type => uniqueTypeIds.has(type.id));

// Saving the result to the tempFilesDir directory
fs.writeFileSync(outputFilePath, JSON.stringify(matchedAttributeTypes, null, 2), 'utf8');
console.log(`Matched attribute types saved to ${outputFilePath}`);
