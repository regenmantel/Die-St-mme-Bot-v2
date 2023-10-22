const {conn} = require('../../functions/conn');
const {timeConverter} = require("../../functions/timeConverter");

const { inlineCode } = require('discord.js');

module.exports = {
    name: "reportCommand",
    run: async(client, interaction) => {
        let messageId = interaction.fields.getTextInputValue('messageId');
        let reportMessage = interaction.fields.getTextInputValue('reportMessage');

        await interaction.reply({
            content: `test${messageId} \n test${reportMessage}`,
            ephemeral: true
        }); 
    }
};