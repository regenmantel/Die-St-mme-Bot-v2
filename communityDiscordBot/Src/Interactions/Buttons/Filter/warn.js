const config = require('../../../Credentials/Config');
const {conn} = require('../../../functions/conn');
const {log} = require('../../../functions/log');

const {
    ActionRowBuilder,
    InteractionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    name: "warn",
    run: async (client, interaction) => {

        const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
        let match, channelID, messageID;

        while (match = regex.exec(interaction.message.embeds[0].fields[1].value)) {
            channelID = match[1];
            messageID = match[2];
        }

        const channel = client.channels.cache.get(channelID);
        const message = channel.messages.cache.get(messageID);

        let user;
        if(!message){
            let userID = interaction.message.embeds[0].fields[0].value.replace("<@","");
            userID = userID.replace(">","");
            user = await client.users.fetch(userID, false);
        }else{
            user = await client.users.fetch(message.author.id, false);
        }

        const modal = new ModalBuilder()
            .setCustomId('warnPlayer')
            .setTitle(`Verwarnung für ${user.username}`)

        // Add components to modal

        // Create the text input components
        const warnPoints = new TextInputBuilder()
            .setCustomId('warnPoints')
            .setLabel('Verwarnpunkte')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(2)
            .setPlaceholder('z.B 2')
            .setRequired(true)
        const warnReason = new TextInputBuilder()
            .setCustomId('warnReason')
            .setLabel('Begründung')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(50)
            .setPlaceholder('z.B Beleidigung')
            .setRequired(false)
        const expiryDate = new TextInputBuilder()
            .setCustomId('expiryDate')
            .setLabel('Ablaufdatum (Standard 30)')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(2)
            .setPlaceholder('z.B 30')
            .setRequired(false)

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(warnPoints);
        const secondActionRow = new ActionRowBuilder().addComponents(warnReason);
        const thirdActionRow = new ActionRowBuilder().addComponents(expiryDate);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow , thirdActionRow);

        await interaction.showModal(modal);
    }
};