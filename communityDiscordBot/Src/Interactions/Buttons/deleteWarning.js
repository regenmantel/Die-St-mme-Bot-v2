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
    name: "deleteWarning",
    run: async (client, interaction) => {

        const modal = new ModalBuilder()
            .setCustomId('deleteWarningUser')
            .setTitle(`Verwarnung löschen`)
            .addComponents([
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('warningDatabaseID')
                        .setLabel('Welche Verwarnung soll gelöscht werden?')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(3)
                        .setPlaceholder('z.B ID: 69')
                        .setRequired(true),
                ),
            ]);
        await interaction.showModal(modal);
    }
};