const fs = require('fs');
const path = require('path');

// Load the configuration
const targetConfig = require('./targetConfig.json');

// Define file paths
const sourceRelationTypesPath = path.join(targetConfig.backupDir, 'relationTypes.json');
const targetRelationTypesPath = path.join(targetConfig.tempFilesDir, 'target_relationTypes.json');
const mappingFilePath = path.join(targetConfig.tempFilesDir, 'relationTypeMappings.json');

// Read and parse the JSON files
const sourceRelationTypes = JSON.parse(fs.readFileSync(sourceRelationTypesPath, 'utf8'));
const targetRelationTypes = JSON.parse(fs.readFileSync(targetRelationTypesPath, 'utf8'));

// Create a map for quick lookup based on uniqueKey
const targetRelationTypesMap = new Map(targetRelationTypes.map(rt => [rt.uniqueKey, rt.id]));

// Generate the mappings, excluding identical sourceId and targetId
const mappings = sourceRelationTypes.map(sourceRT => {
  const targetId = targetRelationTypesMap.get(sourceRT.uniqueKey);
  if (targetId && sourceRT.id !== targetId) {
    return { sourceId: sourceRT.id, targetId: targetId };
  }
  return null;
}).filter(mapping => mapping !== null);

// Write the mappings to a new JSON file
fs.writeFileSync(mappingFilePath, JSON.stringify(mappings, null, 2), 'utf8');
console.log(`Relation type mappings saved to ${mappingFilePath}`);
