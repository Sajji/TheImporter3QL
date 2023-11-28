const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const targetConfig = require('./targetConfig.json');

const backupDir = targetConfig.backupDir; // Get the backupDir from targetConfig
const tempFilesDir = targetConfig.tempFilesDir; // Get the tempFilesDir from targetConfig
const assetsPath = path.join(backupDir, 'assets.json');
const domainIdMappingsPath = path.join(tempFilesDir, 'domainIdMappings.json');

// Read and parse the JSON files
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
const domainIdMappings = JSON.parse(fs.readFileSync(domainIdMappingsPath, 'utf8'));

// Create a map for quick lookup
const domainIdMap = new Map(domainIdMappings.map(mapping => [mapping.oldId, mapping.newId]));

// Create an array to store asset id mappings
const assetIdMappings = [];

// Update domainId and id in assets
const updatedAssets = assets.map(asset => {
    const newAsset = { ...asset };

    // Update domainId
    if (domainIdMap.has(asset.domainId)) {
        newAsset.domainId = domainIdMap.get(asset.domainId);
    }

    // Generate new UUID for asset id
    const oldId = asset.id;
    const newId = uuidv4();
    newAsset.id = newId;

    // Store the old and new id in assetIdMappings
    assetIdMappings.push({ oldId, newId });

    return newAsset;
});

// Write the updated assets to a new JSON file in the tempFilesDir
const updatedAssetsPath = path.join(tempFilesDir, 'assets.json');
fs.writeFileSync(updatedAssetsPath, JSON.stringify(updatedAssets, null, 2), 'utf8');
console.log(`Updated assets saved to ${updatedAssetsPath}`);

// Write the asset id mappings to a new JSON file in the tempFilesDir
const assetIdMappingsPath = path.join(tempFilesDir, 'assetIdMappings.json');
fs.writeFileSync(assetIdMappingsPath, JSON.stringify(assetIdMappings, null, 2), 'utf8');
console.log(`Asset ID mappings saved to ${assetIdMappingsPath}`);