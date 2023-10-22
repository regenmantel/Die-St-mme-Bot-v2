const {conn} = require('../../functions/conn');
const {timeConverter} = require("../../functions/timeConverter");

const { inlineCode } = require('discord.js');

module.exports = {
    name: "linkProfile",
    run: async(client, interaction) => {
        let account = interaction.fields.getTextInputValue('account');
        
        await conn('UPDATE `users` SET inGameAccount = ? WHERE discordUserId = ?', [account, interaction.user.id]);

        await interaction.reply({
            content: `In-Game Account ${account} wurde erfolgreich eingetragen.`,
            ephemeral: true
        }); 
    }
};