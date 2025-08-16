const discord = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const config = require("../config.json");
async function initializeController() {
  for (let token of config.tokens) {
    const client = new discord.Client({
      intents: ["Guilds", "GuildMessages", "MessageContent"],
      presence: {
        activities: [
          {
            name: "Manager",
            type: discord.ActivityType.Custom,
            state: "Managing bots",
          },
        ],
        status: "online",
      },
    });
    client.cooldowns = new discord.Collection();
    eventHandler(client, token);
    await client.login(token);
  }
}
module.exports={initializeController}

