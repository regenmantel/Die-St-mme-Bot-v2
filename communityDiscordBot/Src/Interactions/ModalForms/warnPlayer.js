const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {refreshWarningPoints} = require('../../functions/refreshWarningPoints');
const {log} = require('../../functions/log');

const {
    inlineCode,
    codeBlock,
    ActionRowBuilder,
    InteractionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: "warnPlayer",
    run: async (client, interaction) => {
        const warnChannel = interaction.guild.channels.cache.get(config.server.channels.warnChannelId);

        const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
        let match, channelID, messageID;

        while (match = regex.exec(interaction.message.embeds[0].fields[1].value)) {
            channelID = match[1];
            messageID = match[2];
        }

        const channel = client.channels.cache.get(channelID);
        const message = channel.messages.cache.get(messageID);

        let user;
        let messageContent = "";
        if (!message) {
            let userID = interaction.message.embeds[0].fields[0].value.replace("<@", "");
            userID = userID.replace(">", "");
            user = await client.users.fetch(userID, false);
            messageContent = interaction.message.embeds[0].fields[3].value;
        } else {
            user = await client.users.fetch(message.author.id, false);
            messageContent = message.content;
            if(message.attachments.length){
                messageContent += "\nAnhang:";
                message.attachments.forEach((attachment)=>{
                    messageContent += `\n${attachment.url}`
                })
            }
            let messageHistory = await conn("SELECT * FROM `changeMessageArchiv` where channelID = ? and messageID = ? ORDER BY timeunix ASC", [message.channelId, message.id])
            if (messageHistory.length) {
                messageContent += `\nBearbeitungen:`
                let i = 1;
                messageHistory.forEach((element) => {
                    messageContent += `\nBearbeitung ${i}: ${element["oldMessage"]}`
                    i++;
                })
            }
        }

        let response = interaction.fields.getTextInputValue('warnReason');
        let warningPoints = parseInt(interaction.fields.getTextInputValue('warnPoints'));
        let expiryDate = parseInt(interaction.fields.getTextInputValue('expiryDate'));

        if (isNaN(warningPoints)) {
            warningPoints = 1;
        }

        if (isNaN(expiryDate)) {
            expiryDate = 1;
        }

        let warningTime = Math.round(Date.now() / 1000);
        let expiryTime = warningTime + (expiryDate * 86400);

        await interaction.message.edit({
            components: [
                new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setCustomId('warn')
                        .setLabel('Spieler wurde bereits verwarnt.')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⚠️')
                        .setDisabled(true),
                )
            ]
        });


        const warnMessage = new EmbedBuilder();
        warnMessage
            .setTitle(`Die Stämme Discord Bot - Verwarnung`)
            .setAuthor({
                name: 'Die Stämme Discord Profil',
                iconURL: `${interaction.guild.iconURL()}`
            })
            .setDescription(`Spieler ${inlineCode(user.username)} wurde verwarnt von ${inlineCode(interaction.user.username)}. \n\nGrund: ${inlineCode(response)}\nPunkte: ${inlineCode(warningPoints)}\nAblaufdatum (Tage): ${inlineCode(expiryDate)}\nNachricht: ${inlineCode(messageContent)}`)
            .setFooter({text: `Die Stämme Discord Team`})
            .setTimestamp()
            .setColor(0xED3D7D);

        await warnChannel.send({
            embeds: [warnMessage]
        });
        await interaction.deferUpdate();

        await conn('INSERT INTO `warningPoints` (discordUserId,warningPoints,warningPerson,warningTime,reason,expiryDate,message) VALUES (?,?,?,?,?,?,?)', [user.id, warningPoints, interaction.user.id, warningTime, response, expiryTime, messageContent]);

        await refreshWarningPoints(user.id);

        const userPN = new EmbedBuilder();
        userPN
            .setTitle(`Die Stämme Discord Bot - Verwarnung`)
            .setAuthor({
                name: 'Die Stämme Discord Profil',
                iconURL: `${interaction.guild.iconURL()}`
            })
            .setDescription(`Du hast gerade eine Verwarnung von ${inlineCode(interaction.user.username)} bekommen.\n\nDeine Nachricht: ${inlineCode(messageContent)}\nGrund: ${response}\nPunkte: ${warningPoints}\nAblaufdatum (Tage): ${expiryDate}`)
            .setFooter({text: `Die Stämme Discord Team`})
            .setTimestamp()
            .setColor(0xED3D7D);
        if (message) {
            client.channels.fetch(channelID).then(channel => {
                channel.messages.delete(messageID);
            });
        }
        try {
            await user.send({
                embeds: [userPN]
            });
        } catch (e) {

        }

    }
};