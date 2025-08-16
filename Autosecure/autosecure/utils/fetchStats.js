const getUUID = require("./getUUID");
const axios = require("axios");
const { key } = require("../../config.json");
const { queryParams } = require("../../db/db");
const generate = require("./generate");

module.exports = async (username) => {
  let uuid = await getUUID(username);

  if (!uuid) {
    console.error(`UUID not found for username: ${username}`);
    return;
  }

  let stats = {
    name: username,
    bedwars: {
      level: 0,
      coins: 0,
      winstreak: 0,
      finalKills: 0,
      finalDeaths: 0,
      fkdr: 0,
      wins: 0,
      losses: 0,
      wlr: 0,
    },
    rank: "None",
  };

  try {
    // Fetch player data from Hypixel API
    let { data } = await axios.get(`https://api.hypixel.net/player?key=${key}&uuid=${uuid}`);
    let player = data.player;

    if (!player) {
      console.error("Failed to retrieve player data.");
      return;
    }

    // Populate Bedwars stats
    let bedwarsStats = player.stats.Bedwars;
    if (bedwarsStats) {
      stats.bedwars.level = Math.floor(bedwarsStats.Experience / 5000); // Adjust as necessary
      stats.bedwars.coins = bedwarsStats.coins;
      stats.bedwars.winstreak = bedwarsStats.winstreak;
      stats.bedwars.finalKills = bedwarsStats.final_kills_bedwars;
      stats.bedwars.finalDeaths = bedwarsStats.final_deaths_bedwars;
      stats.bedwars.fkdr = (bedwarsStats.final_kills_bedwars / bedwarsStats.final_deaths_bedwars).toFixed(2);
      stats.bedwars.wins = bedwarsStats.wins_bedwars;
      stats.bedwars.losses = bedwarsStats.losses_bedwars;
      stats.bedwars.wlr = (bedwarsStats.wins_bedwars / bedwarsStats.losses_bedwars).toFixed(2);
    }

    // Store in database
    let id = generate(32);
    await queryParams(`INSERT INTO skyblock_stats(id, data) VALUES(?, ?)`, [id, JSON.stringify(stats)]);

    return id;
  } catch (error) {
    console.error(`Error fetching Bedwars stats for ${username}:`, error.message);
  }
};
