const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");
const {refreshWarningPoints} = require("../../../../../functions/refreshWarningPoints");

const {
    inlineCode,
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "warnings",
    description: "Sieh dir deine Verwarnungen auf dem Server an!",
    run: async (client, interaction) => {
        const discordUserId = interaction.user.id;
        let warningPoints = await conn('SELECT * FROM `warningPoints` WHERE discordUserID = ? ORDER BY warningTime ASC', [discordUserId]);

        //#region Only for message without embed
        let showWarnings = ``;
        if (warningPoints.length < 1) {
            showWarnings = `${interaction.user.username} hat keine Verwarnungen.`;
        } else {
            for (let i = 0; i < warningPoints.length; i++) {
                let element = warningPoints[i];
                showWarnings += `Punkte: ${inlineCode(element['warningPoints'])} | Nachricht: ${inlineCode(element['message'])} | Grund: ${inlineCode(element['reason'])} | Ablauf: ${inlineCode(timeConverter(element['expiryDate']))} | Verwarnt von: ${inlineCode(client.users.cache.get(element["warningPerson"]).username)}\n`;
            }
        }

        await interaction.reply({
            content: `⚠️ Deine Verwarnungen ${inlineCode(interaction.user.username)} ⚠️\n${showWarnings}`,
            ephemeral: true
        });
    }
}