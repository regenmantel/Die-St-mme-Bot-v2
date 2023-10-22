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
    name: "previousSiteWarnings",
    run: async (client, interaction) => {
        let pageInfo = interaction.message.embeds[0].footer.text;
        let regex = /Seite (\d+) von (\d+)/;

        let match = regex.exec(pageInfo);

        let currentPage = parseInt(match[1]);
        let lastPage = parseInt(match[2]);
        
        //let nextButton = interaction.message.components[0].components[3].data; //Nicht löschen

        let title, fields;
        if(currentPage === 1) {
            await interaction.reply({
                content: 'min page reached lol',
                ephemeral: true
            });
        } else {
            currentPage--;
        }

        title = interaction.message.embeds[0].title;
        fields = interaction.message.embeds[0].fields;

        const exampleEmbed = {
            color: 0x0099ff,
            title: `${title}`,
            fields: fields,
            footer: {
                text: `Seite ${currentPage} von ${lastPage}`
            }
        };

        await interaction.message.edit({
            embeds: [exampleEmbed]
        });

        await interaction.deferUpdate();
    }
};