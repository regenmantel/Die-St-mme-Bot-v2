const config = require('../../../Credentials/Config');
const {conn} = require('../../../functions/conn');
const {log} = require('../../../functions/log');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    name: "delete",
    run: async (client, interaction) => {
        const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
        let match, channelID, messageID;

        while (match = regex.exec(interaction.message.embeds[0].fields[1].value)) {
            channelID = match[1];
            messageID = match[2];
        }

        const channel = await client.channels.cache.get(channelID);
        const message = await channel.messages.cache.get(messageID);

        if(!message){
            await message.delete()
        }


        await interaction.message.edit({
            components: [
                new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setCustomId('delete')
                        .setLabel('Nachricht wurde gelöscht')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🗑️')
                        .setDisabled(true),
                )
            ]
        });

        await interaction.reply({
            content: `:white_check_mark: · Nachricht wurde gelöscht.`,
            ephemeral: true,
        });
    }
};