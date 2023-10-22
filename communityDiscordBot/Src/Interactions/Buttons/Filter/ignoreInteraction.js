const config = require('../../../Credentials/Config');
const {conn} = require('../../../functions/conn');
const {log} = require('../../../functions/log');

const {
    inlineCode,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    name: "ignore",
    run: async (client, interaction) => {

        let value = interaction.message.embeds[0].fields.length > 0 ? interaction.message.embeds[0].fields[1].value : inlineCode("Unbekannte Nachricht");
        await interaction.message.edit({
            embeds: [],
            content: `:white_check_mark: · ${inlineCode(interaction.user.username)} hat die Nachricht ${value} ignoriert.`,
            components: []
        });

        await interaction.reply({
            content: `:white_check_mark: · Botmeldung ignoriert.`,
            ephemeral: true
        })
    }
};