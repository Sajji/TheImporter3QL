const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const targetConfig = require('./targetConfig.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// ... [previous functions]

// Function to update communities with selected parent ID
const updateCommunitiesWithParentId = async (selectedCommunityId, communities) => {
  return communities.map(community => {
    if (!community.parentId) {
      community.parentId = selectedCommunityId; // Set parentId to the selected community ID
    }
    return community;
  });
};

// Function to save updated communities to a file in tempFilesDir
const saveUpdatedCommunities = (updatedCommunities) => {
  const tempCommunitiesPath = path.join(targetConfig.tempFilesDir, 'communities.json');
  fs.writeFileSync(tempCommunitiesPath, JSON.stringify(updatedCommunities, null, 2), 'utf8');
  console.log(`Updated communities saved to ${tempCommunitiesPath}`);
};

// Main function
const main = async () => {
  // ... [previous code to select a community]

  if (selectedCommunity) {
    // Read communities from backupDir
    const backupCommunitiesPath = path.join(targetConfig.backupDir, 'communities.json');
    const communities = JSON.parse(fs.readFileSync(backupCommunitiesPath, 'utf8'));

    // Update communities with selected parent ID
    const updatedCommunities = await updateCommunitiesWithParentId(selectedCommunity.id, communities);

    // Save updated communities
    saveUpdatedCommunities(updatedCommunities);
  }

  rl.close();
};

main();
