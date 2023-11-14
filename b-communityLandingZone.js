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

// Function to list communities and let user select one
const listAndSelectCommunity = async (communities) => {
  communities.forEach((community, index) => {
    console.log(`${index + 1}. ${community.name}`);
  });

  const selection = await askQuestion('Select a community by entering the corresponding number: ');
  const selectedCommunity = communities[parseInt(selection) - 1];

  if (selectedCommunity) {
    console.log(`You selected: ${selectedCommunity.name}`);
    return selectedCommunity; // returning selected community object
  } else {
    console.log('Invalid selection. Please try again.');
    return await listAndSelectCommunity(communities);
  }
};

// Function to list communities
const listCommunities = async () => {
  try {
    const response = await axios.get(`https://${targetConfig.targetDomain}/rest/2.0/communities`, {
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
      }
    });

    return await listAndSelectCommunity(response.data.results);
  } catch (error) {
    console.error('Error listing communities:', error.message);
  }
};

// Function to search communities
const searchCommunities = async (searchTerm) => {
  try {
    const response = await axios.get(`https://${targetConfig.targetDomain}/rest/2.0/communities`, {
      params: {
        name: searchTerm,
        nameMatchMode: 'ANYWHERE'
      },
      auth: {
        username: targetConfig.targetUsername,
        password: targetConfig.targetPassword
      }
    });

    return await listAndSelectCommunity(response.data.results);
  } catch (error) {
    console.error('Error searching for communities:', error.message);
  }
};

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
  const choice = await askQuestion('Choose an option:\n1. List all communities\n2. Search for a community\nEnter your choice (1 or 2): ');

  let selectedCommunity;

  if (choice === '1') {
    selectedCommunity = await listCommunities();
  } else if (choice === '2') {
    const searchTerm = await askQuestion('Enter search term: ');
    selectedCommunity = await searchCommunities(searchTerm);
  } else {
    console.log('Invalid choice.');
  }

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