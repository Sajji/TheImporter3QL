const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
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

// Create an array to store domain id mappings
const domainIdMappings = [];

// Update communityId and id in domains
const updatedDomains = domains.map(domain => {
  const newDomain = { ...domain };

  // Update communityId
  if (uuidMap.has(domain.communityId)) {
    newDomain.communityId = uuidMap.get(domain.communityId);
  }

  // Generate new UUID for domain id
  const oldId = domain.id;
  const newId = uuidv4();
  newDomain.id = newId;

  // Store the old and new id in domainIdMappings
  domainIdMappings.push({ oldId, newId });

  return newDomain;
});

// Write the updated domains to a new JSON file in the tempFilesDir
const updatedDomainsPath = path.join(tempFilesDir, 'domains.json');
fs.writeFileSync(updatedDomainsPath, JSON.stringify(updatedDomains, null, 2), 'utf8');
console.log(`Updated domains saved to ${updatedDomainsPath}`);

// Write the domain id mappings to a new JSON file in the tempFilesDir
const domainIdMappingsPath = path.join(tempFilesDir, 'domainIdMappings.json');
fs.writeFileSync(domainIdMappingsPath, JSON.stringify(domainIdMappings, null, 2), 'utf8');
console.log(`Domain ID mappings saved to ${domainIdMappingsPath}`);