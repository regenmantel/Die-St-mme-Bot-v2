const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {log} = require('../../functions/log');

const {
    ActionRowBuilder,
    InteractionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    name: "clearWarnings",
    run: async (client, interaction) => {
        //await conn('DELETE * FROM `warningPoints` WHERE discordUserID = ?', [discordUserId]);

        await interaction.reply({
            content: `TODO ..`,
            ephemeral: true
        });
    }
};