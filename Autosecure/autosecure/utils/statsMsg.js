const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { queryParams } = require("../../db/db");
const shorten = require("../utils/shorten");

module.exports = async (id, mode = "skyblock") => {
  let stats = await queryParams(`SELECT * FROM skyblock_stats WHERE id=?`, [id]);

  if (stats.length === 0) {
    return {
      content: `Error: No stats found for the given ID.`,
      ephemeral: true,
    };
  }

  stats = JSON.parse(stats[0].data);
  let embed = new EmbedBuilder().setColor(0x025e73).setTitle(`Stats for ${stats.name} [${stats.rank || 'None'}]`);

  if (mode === "skyblock") {
    let profile = stats.skyblock[0];
    if (profile) {
      embed.setDescription(`**Skyblock Profile: ${profile.name}**`)
        .addFields(
          { name: "Networth", value: `${shorten(profile.networth)}`, inline: true },
          { name: "Skills", value: profile.skills ? Object.entries(profile.skills).map(([name, lvl]) => `${name}: ${lvl}`).join("\n") : "No Skills", inline: true },
          { name: "Slayers", value: profile.slayers ? Object.entries(profile.slayers).map(([name, lvl]) => `${name}: ${lvl}`).join("\n") : "No Slayers", inline: true },
          { name: "Catacombs", value: profile.catacombs ? Object.entries(profile.catacombs).map(([name, lvl]) => `${name}: ${lvl}`).join("\n") : "No Catacombs", inline: true }
        );
    } else {
      embed.setDescription("No Skyblock profile found.");
    }
  } else if (mode === "bedwars") {
    let bedwars = stats.bedwars;
    if (bedwars) {
      embed.setDescription("**Bedwars Stats**")
        .addFields(
          { name: "Level", value: `${bedwars.level}`, inline: true },
          { name: "Coins", value: `${shorten(bedwars.coins)}`, inline: true },
          { name: "Winstreak", value: `${bedwars.winstreak}`, inline: true },
          { name: "Final Kills", value: `${bedwars.finalKills}`, inline: true },
          { name: "Final Deaths", value: `${bedwars.finalDeaths}`, inline: true },
          { name: "FKDR", value: `${bedwars.fkdr}`, inline: true },
          { name: "Wins", value: `${bedwars.wins}`, inline: true },
          { name: "Losses", value: `${bedwars.losses}`, inline: true },
          { name: "Win Rate", value: `${bedwars.wlr}`, inline: true }
        );
    } else {
      embed.setDescription("No Bedwars stats found.");
    }
    embed.setColor(0xdb810b); // Bedwars color
  }

  let actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Skyblock")
      .setCustomId(`skyblock|${id}`)
      .setStyle(mode === "skyblock" ? 3 : 1)
      .setDisabled(mode === "skyblock"),
    new ButtonBuilder()
      .setLabel("Bedwars")
      .setCustomId(`bedwars|${id}`)
      .setStyle(mode === "bedwars" ? 3 : 1)
      .setDisabled(mode === "bedwars")
  );

  return {
    embeds: [embed],
    components: [actionRow],
    ephemeral: true,
  };
};
