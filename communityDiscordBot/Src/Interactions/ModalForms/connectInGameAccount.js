const { inlineCode } = require('discord.js');
const {conn} = require('../../functions/conn');

module.exports = {
    name: "connectIGAccount",
    run: async(client, interaction) => {
        let account = interaction.fields.getTextInputValue('connect');

        await conn('UPDATE `users` SET inGameAccount = ? WHERE discordUserId = ?', [account, interaction.user.id]);

        await interaction.reply({
            content: `In-Game Account ${account} wurde erfolgreich eingetragen.`,
            ephemeral: true
        }); 
    }
};