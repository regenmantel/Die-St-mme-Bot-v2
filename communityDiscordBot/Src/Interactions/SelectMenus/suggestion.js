const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {refreshWarningPoints} = require('../../functions/refreshWarningPoints');
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
    name: "suggestion",
    run: async (client, interaction) => {

        const warnChannel = interaction.guild.channels.cache.get(config.server.channels.warnChannelId);
        const value = parseInt(interaction.values[0]);
        let response, warningPoints, expiryDate;

        const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
        let match, channelID, messageID;

        while (match = regex.exec(interaction.message.embeds[0].fields[1].value)) {
            channelID = match[1];
            messageID = match[2];
        }

        const channel = await client.channels.cache.get(channelID);
        const message = await channel.messages.cache.get(messageID);

        let user;
        let messageContent = "";
        let guildUser;
        if (!message) {
            let userID = interaction.message.embeds[0].fields[0].value.replace("<@", "");
            userID = userID.replace(">", "");
            user = await client.users.fetch(userID, false);
            messageContent = interaction.message.embeds[0].fields[3].value;
            guildUser = await interaction.guild.members.cache.get(userID)

        } else {
            guildUser = await interaction.guild.members.cache.get(message.author.id)
            user = message.author
            messageContent = message.content;
            if (message.attachments) {
                messageContent += `\n Anhang:`
                message.attachments.forEach((attachment) => {
                    messageContent += `\n${attachment.url}`
                })
            }
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
        switch (value) {
            case 0:
                response = "Unpassender Beitrag";
                warningPoints = 1;
                expiryDate = 30;
                break;
            case 1:
                response = "Leichte Beleidigung";
                warningPoints = 2;
                expiryDate = 30;
                break;
            case 2:
                response = "Nicht beachten einer Moderatoren Anweisung";
                warningPoints = 3;
                expiryDate = 30;
                break;
            case 3:
                response = "Beleidigung";
                warningPoints = 5;
                expiryDate = 30;
                break;
            case 4:
                response = "Werbung";
                warningPoints = 5;
                expiryDate = 30;
                break;
            case 5:
                response = "Extreme Beleidigung";
                warningPoints = 10;
                expiryDate = 30;
                break;
            case 6:
                response = "Wiederholtes Ignorieren einer Moderatorenanweisung";
                warningPoints = 10;
                expiryDate = 30;
                break;
            case 7:
                response = "Wiederholt Werbung";
                warningPoints = 10;
                expiryDate = 30;
                break;
            case 8:
                response = "Verbreitung von unerlaubten Scripten/Bots";
                warningPoints = 10;
                expiryDate = 3000;
                break;
            case 9:
                response = "Dauerhaft unangebrachte Beiträge";
                warningPoints = 10;
                expiryDate = 3000;
                break;
            case 10:
                response = "Politisch extreme Inhalte";
                warningPoints = 10;
                expiryDate = 3000;
                break;
            case 11:
                response = "Unpassendes Bildmaterial";
                warningPoints = 10;
                expiryDate = 3000;
                break;
            case 12:
                response = "Doxing";
                warningPoints = 10;
                expiryDate = 3000;
                break;
            case 13:
                response = "Timeout 1h";
                warningPoints = 0;
                expiryDate = 30;
                await guildUser.timeout(1000 * 60 * 60)
                break;
            case 14:
                response = "Timeout 12h";
                warningPoints = 0;
                expiryDate = 30;
                await guildUser.timeout(1000 * 60 * 60 * 12)
                break;
        }

        let warningTime = Math.round(Date.now() / 1000);
        expiryTime = warningTime + (expiryDate * 86400);

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
        const warnMessage = new EmbedBuilder()
            .setTitle(`Die Stämme Discord Bot - Verwarnung`)
            .setAuthor({
                name: 'Die Stämme Discord Profil',
                iconURL: `${interaction.guild.iconURL()}`
            })
            .setDescription(`Spieler ${inlineCode(user.username)} wurde verwarnt von ${inlineCode(interaction.user.username)}. \n\nDeine Nachricht: ${inlineCode(messageContent)}\nGrund: ${inlineCode(response)}\nPunkte: ${inlineCode(warningPoints)}\nAblaufdatum (Tage): ${inlineCode(expiryDate)}`)
            .setFooter({text: `Die Stämme Discord Team`})
            .setTimestamp()
            .setColor(0xED3D7D);

        await warnChannel.send({
            embeds: [warnMessage]
        });
        await interaction.deferUpdate();

        await conn('INSERT INTO `warningPoints` (discordUserId,warningPoints,warningPerson,warningTime,reason,expiryDate,message) VALUES (?,?,?,?,?,?,?)', [user.id, warningPoints, interaction.user.id, warningTime, response, expiryTime, messageContent]);

        await refreshWarningPoints(user.id);

        const userPN = new EmbedBuilder()
            .setTitle(`Die Stämme Discord Bot - Verwarnung`)
            .setAuthor({
                name: 'Die Stämme Discord Profil',
                iconURL: `${interaction.guild.iconURL()}`
            })
            .setDescription(`Du hast gerade eine Verwarnung von ${inlineCode(interaction.user.username)} bekommen.\n\nDeine Nachricht: ${inlineCode(messageContent)}\nGrund: ${response}\nPunkte: ${warningPoints}\nAblaufdatum (Tage): ${expiryDate}`)
            .setFooter({text: `Die Stämme Discord Team`})
            .setTimestamp()
            .setColor(0xED3D7D);


        if(message){
            await message.delete();
        }

        await user.send({
            embeds: [userPN]
        });
    }
};