const fs = require('fs');
const path = require('path');
const targetConfig = require('./targetConfig.json');

const backupDir = targetConfig.backupDir; // Get the backupDir from targetConfig
const tempFilesDir = targetConfig.tempFilesDir; // Get the tempFilesDir from targetConfig
const domainsPath = path.join(backupDir, 'domains.json');
const uuidMappingsPath = path.join(tempFilesDir, 'uuidMappings.json');

// Read and parse the JSON files
const domains = JSON.parse(fs.readFileSync(domainsPath, 'utf8'));
const uuidMappings = JSON.parse(fs.readFileSync(uuidMappingsPath, 'utf8'));

// Create a map for quick lookup
const uuidMap = new Map(uuidMappings.map(mapping => [mapping.oldId, mapping.newId]));

// Update communityId in domains
const updatedDomains = domains.map(domain => {
  if (uuidMap.has(domain.communityId)) {
    return { ...domain, communityId: uuidMap.get(domain.communityId) };
  }
  return domain;
});

// Write the updated domains to a new JSON file in the tempFilesDir
const updatedDomainsPath = path.join(tempFilesDir, 'domains.json');
fs.writeFileSync(updatedDomainsPath, JSON.stringify(updatedDomains, null, 2), 'utf8');
console.log(`Updated domains saved to ${updatedDomainsPath}`);
