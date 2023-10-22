const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {log} = require('../../functions/log');

const {
    ActionRowBuilder,
    InteractionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle, inlineCode
} = require('discord.js');
const fs = require("fs");
const path = require("path");
const quizDelay = require("../../functions/quizDelay");

module.exports = {
    name: "answerQuiz",
    run: async (client, interaction) => {
        await quizDelay.run(interaction.message.id,interaction.message)
        const modal = new ModalBuilder()
            .setCustomId('answerQuiz')
            .setTitle(`Quiz`)
        const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setLabel('Antwort')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(50)
            .setPlaceholder('Antwort')
            .setRequired(true)

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(answer);
        // Add inputs to the modal
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};