const fs = require('fs');
const path = require('path');

const tempFilesDir = './tempFilesDir'; // Adjust path as necessary
const matchedRelationTypesPath = path.join(tempFilesDir, 'matchedRelationTypes.json');
const targetRelationTypesPath = path.join(tempFilesDir, 'target_relationTypes.json');
const missingRelationTypesPath = path.join(tempFilesDir, 'missingRelationTypes.json');

// Read and parse the JSON files
const matchedRelationTypes = JSON.parse(fs.readFileSync(matchedRelationTypesPath, 'utf8'));
const targetRelationTypes = JSON.parse(fs.readFileSync(targetRelationTypesPath, 'utf8'));

// Extract unique keys from target relation types
const targetUniqueKeys = new Set(targetRelationTypes.map(rt => rt.uniqueKey));

// Filter out the matched relation types that are not in the target relation types
const missingRelationTypes = matchedRelationTypes.filter(rt => !targetUniqueKeys.has(rt.uniqueKey));

// Write the missing relation types to a new JSON file
fs.writeFileSync(missingRelationTypesPath, JSON.stringify(missingRelationTypes, null, 2), 'utf8');
console.log(`Missing relation types saved to ${missingRelationTypesPath}`);
