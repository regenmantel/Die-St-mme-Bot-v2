const {conn} = require('../../functions/conn');

const { inlineCode } = require('discord.js');

module.exports = {
    name: "deleteWarningUser",
    run: async(client, interaction) => {
        const warningID = interaction.fields.getTextInputValue('warningDatabaseID');

        await conn('DELETE FROM `warningPoints` WHERE ID = ?', [warningID]);

        const warnID = `ID#${warningID}`;
        await interaction.reply({
            content: `Verwarnung mit der ${inlineCode(warnID)} wurde gelöscht von ${inlineCode(interaction.user.username)}.`,
            ephemeral: true
        });
    }
};