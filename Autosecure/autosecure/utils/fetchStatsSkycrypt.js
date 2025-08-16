const axios = require("axios");

module.exports = async (username) => {
  try {
    console.log(`Fetching Skyblock stats for ${username} from SkyCrypt...`);
    const { data } = await axios.get(`https://sky.shiiyu.moe/api/v2/profile/${username}`);

    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No profile found for ${username}`);
    }
    for (let profiles of Object.values(data)) {
      for (let profile of Object.values(profiles)) {
        if (profile.current) {
          return profile;
        }
      }
    }
    throw new Error(`No current profile found for ${username}`);
  } catch (error) {
    console.error(`Error fetching Skyblock stats for ${username}:`, error.message);
    throw new Error(`SkyCryptError: No user with the name '${username}' was found`);
  }
};
