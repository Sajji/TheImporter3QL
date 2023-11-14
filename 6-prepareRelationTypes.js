const fs = require('fs');
const path = require('path');
const targetConfig = require('./targetConfig.json'); // Assuming this has the paths for backupDir and tempFilesDir

const relationTypesPath = path.join(targetConfig.backupDir, 'relationTypes.json');
const uniqueRelationTypesPath = path.join(targetConfig.backupDir, 'uniqueRelationTypes.json');
const outputFilePath = path.join(targetConfig.tempFilesDir, 'matchedRelationTypes.json');

const relationTypes = JSON.parse(fs.readFileSync(relationTypesPath, 'utf8'));
const uniqueRelationTypes = JSON.parse(fs.readFileSync(uniqueRelationTypesPath, 'utf8'));

// Creating a Set for faster lookup
const uniqueTypeIds = new Set(uniqueRelationTypes.map(type => type.typeId));

// Filtering and creating new array
const matchedRelationTypes = relationTypes.filter(type => uniqueTypeIds.has(type.id));

// Saving the result to the tempFilesDir directory
fs.writeFileSync(outputFilePath, JSON.stringify(matchedRelationTypes, null, 2), 'utf8');
console.log(`Matched relation types saved to ${outputFilePath}`);
