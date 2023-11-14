const fs = require('fs');
const path = require('path');
const readline = require('readline');
const requests = require('./requests'); // Ensure this path is correct

const tempFilesDir = './tempFilesDir'; // Adjust path as necessary
const communitiesPath = path.join(tempFilesDir, 'communities.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to prepare payload for POST (without parentId)
const preparePostPayload = (community, suffix) => ({
  id: community.id,
  name: `${community.name} ${suffix}`,
  description: community.description || ''
});

// Function to prepare payload for PATCH (with parentId)
const preparePatchPayload = (community, suffix) => ({
  id: community.id,
  name: `${community.name} ${suffix}`,
  description: community.description || '',
  parentId: community.parentId
});

const processCommunities = async (communities, suffix) => {
  for (const community of communities) {
    // POST request
    let response = await requests.singlePost('communities', preparePostPayload(community, suffix));
    console.log(`POST response for ${community.name}: Status ${response.status}`);
  }

  for (const community of communities) {
    // PATCH request (only if parentId is present)
    if (community.parentId) {
      let response = await requests.singlePatch(`communities/${community.id}`, preparePatchPayload(community, suffix));
      console.log(`PATCH response for ${community.name}: Status ${response.status}`);
    }
  }
};

const runOperations = async () => {
    try {
        const suffix = await askQuestion("Please provide a suffix to prevent duplicate names: ");
        rl.close();

        const communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf8'));
        await processCommunities(communities, suffix);

        console.log('Processing of communities completed.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

runOperations();
