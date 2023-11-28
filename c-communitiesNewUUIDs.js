const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const tempFilesDir = './tempFilesDir'; // Adjust path as necessary
const communitiesPath = path.join(tempFilesDir, 'communities.json');
const mappingsPath = path.join(tempFilesDir, 'uuidMappings.json');

const communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf8'));
const uuidMappings = [];

// Function to replace UUIDs and update parentId
const updateUUIDs = (communityArray) => {
  communityArray.forEach(community => {
    const oldId = community.id;
    const newId = uuidv4();

    // Map old UUID to new UUID
    uuidMappings.push({ oldId, newId });

    // Replace the id with the new UUID
    community.id = newId;
  });

  // Update parentId with new UUIDs
  communityArray.forEach(community => {
    if (community.parentId) {
      const mapping = uuidMappings.find(mapping => mapping.oldId === community.parentId);
      if (mapping) {
        community.parentId = mapping.newId;
      }
    }
  });
};

updateUUIDs(communities);

// Write updated communities to file
fs.writeFileSync(communitiesPath, JSON.stringify(communities, null, 2), 'utf8');

// Write UUID mappings to file
fs.writeFileSync(mappingsPath, JSON.stringify(uuidMappings, null, 2), 'utf8');

console.log(`Updated communities saved to ${communitiesPath}`);
console.log(`UUID mappings saved to ${mappingsPath}`);