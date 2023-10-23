const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");
const {refreshWarningPoints} = require("../../../../../functions/refreshWarningPoints");

const {
    inlineCode,
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "warn",
    description: "Warne einen Spieler und er bekommt einen Punkt.",
    onlyRoles: [config.server.roles.teamRoleId],
    options: [
        {
            name: "give",
            type: 1,
            description: "Gebe einem User Verwarnungspunkte",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "Wähle ein User aus",
                    required: true,
                },
                {
                    name: "points",
                    type: 4,
                    description: "Gebe die Verwarnungspunkte ein",
                    required: true,
                },
                {
                    name: "reason",
                    type: 3,
                    description: "Gebe einen Grund ein",
                    required: true,
                },
                {
                    name: "timeindays",
                    type: 4,
                    description: "Gebe an wann die Verwarnungspunkte verfallen in Tagen.",
                    required: true,
                },
                {
                    name: "messagelink",
                    type: 3,
                    description: "Bitte kopiere hier den Link der Nachricht hinein.",
                    required: false,
                }
            ]
        },
        {
            name: "show",
            type: 1,
            description: "Lass dir die Punkte von jemanden anzeigen.",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "Wähle ein User aus.",
                    required: true,
                }
            ]
        },
        {
            name: "delete",
            type: 1,
            description: "Entferne eine Verwarnung.",
            options: [
                {
                    name: "id",
                    type: 4,
                    description: "Gebe die ID der Verwarnung ein die du löschen möchtest.",
                    required: true
                }
            ],
        }
    ],
    run: async (client, interaction) => {
        const warnChannel = interaction.guild.channels.cache.get(config.server.channels.warnChannelId);
        let messageUser = "";
        if (interaction.options.getSubcommand() === 'give') {
            let user = interaction.options.getUser('user');
            let discordUserId = user.id;

            let reason = interaction.options.getString('reason');
            let warningPoints = interaction.options.getInteger('points');
            let messageLink = interaction.options.getString('messagelink');
            if (messageLink) {
                const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
                let match, channelID, messageID;

                while (match = regex.exec(messageLink)) {
                    channelID = match[1];
                    messageID = match[2];
                }
                const channel = await client.channels.cache.get(channelID);
                await channel.messages.fetch(messageID)
                    .then(async (message) => {
                        messageUser = message.content;
                        if (message.attachments.length) {
                            messageUser += "\nAnhang:";
                            message.attachments.forEach((attachment) => {
                                messageUser += `\n${attachment.url}`
                            })
                        }
                        let messageHistory = await conn("SELECT * FROM `changeMessageArchiv` where channelID = ? and messageID = ? ORDER BY timeunix ASC", [message.channelId, message.id])
                        if (messageHistory.length) {
                            messageUser += `\nBearbeitungen:`
                            let i = 1;
                            messageHistory.forEach((element) => {
                                messageUser += `\nBearbeitung ${i}: ${element["oldMessage"]}`
                                i++;
                            })
                        }
                        if(message){
                            message.delete()
                        }
                    })
                    .catch();
            }

            let warningPerson = interaction.user.id;

            let warningTime = Math.round(Date.now() / 1000);
            let expiryDate = parseInt(interaction.options.getInteger('timeindays'));
            let expiryTime = warningTime + (expiryDate * 86400);

            const warnMessage = new EmbedBuilder
                .setTitle(`Die Stämme Discord Bot - Verwarnung`)
                .setAuthor({
                    name: 'Die Stämme Discord Profil',
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription(`Spieler ${inlineCode(user.username)} wurde verwarnt von ${inlineCode(interaction.user.username)}. \nGrund: ${inlineCode(reason)}\nPunkte: ${inlineCode(warningPoints)}\nAblaufdatum (Tage): ${inlineCode(expiryDate)}\nNachricht: ${inlineCode(messageUser)}`)
                .setFooter({text: `Die Stämme Discord Team`})
                .setTimestamp()
                .setColor(0xED3D7D);

            await warnChannel.send({
                embeds: [warnMessage]
            });

            await conn('INSERT INTO `warningPoints` (discordUserID,warningPoints,warningPerson,warningTime,reason,expiryDate,message) VALUES (?,?,?,?,?,?,?)', [discordUserId, warningPoints, warningPerson, warningTime, reason, expiryTime, messageUser]);

            await refreshWarningPoints(discordUserId);

            const userPN = new EmbedBuilder()
                .setTitle(`Die Stämme Discord Bot - Verwarnung`)
                .setAuthor({
                    name: 'Die Stämme Discord Profil',
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription(`Du hast gerade eine Verwarnung von ${inlineCode(interaction.user.username)} bekommen.\n\nDeine Nachricht: ${inlineCode(messageUser)}\nGrund: ${reason}\nPunkte: ${warningPoints}\nAblaufdatum (Tage): ${expiryDate}`)
                .setFooter({text: `Die Stämme Discord Team`})
                .setTimestamp()
                .setColor(0xED3D7D);

            try {
                await user.send({
                    embeds: [userPN]
                });
            } catch (e) {

            }

            await interaction.reply({
                content: `⚠️ Spieler wurde verwarnt. ⚠️`,
                ephemeral: true
            })
        } else if (interaction.options.getSubcommand() === 'show') {
            let user = interaction.options.getUser('user');
            let discordUserId = user.id;

            let warnArray = [];
            let embedFields = [];
            let buttonArray = [];
            let currentPage = 1;
            let lastPage;

            const buttonRow = new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                    .setCustomId('deleteWarning')
                    .setLabel('Verwarnung löschen')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🗑'))
                .addComponents(new ButtonBuilder()
                    .setCustomId('clearWarnings')
                    .setLabel('Alle löschen')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑'))

            buttonArray.push(buttonRow);

            let warningPoints = await conn('SELECT * FROM `warningPoints` WHERE discordUserID = ? ORDER BY warningTime ASC', [discordUserId]);

            let showWarnings = ``;
            if (warningPoints.length < 1) {
                showWarnings = `${user.username} hat keine Verwarnungen.`;

                await interaction.reply({
                    content: `⚠️ Verwarnungen von ${inlineCode(user.username)} ⚠️\n${showWarnings}`,
                    ephemeral: true
                });
            } else {
                for (let i = 0; i < warningPoints.length; i++) {
                    let element = warningPoints[i];
                    let warningPerson = (client.users.cache.get(element["warningPerson"])) ? client.users.cache.get(element["warningPerson"]).username : "Unbekannt";
                    let deletePerson = (client.users.cache.get(element["deleteUser"])) ? client.users.cache.get(element["deleteUser"]).username : "-";
                    let message = (element["message"]) ? element["message"] : "-";
                    showWarnings += `ID: ${inlineCode(element['id'])} | Punkte: ${inlineCode(element['warningPoints'])} | Nachricht: ${inlineCode(message)} | Grund: ${inlineCode(element['reason'])} | Ablauf: ${inlineCode(timeConverter(element['expiryDate']))} | Verwarnt von: ${inlineCode(warningPerson)} | Gelöscht von: ${inlineCode(deletePerson)}\n`;
                }

                await interaction.reply({
                    content: `⚠️ Verwarnungen von ${inlineCode(user.username)} ⚠️\n${showWarnings}`,
                    components: buttonArray,
                    ephemeral: true
                });
            }

            //#region Warn Show Embed
            /*
            if (warningPoints.length > 0) {
                let amountWarningPoints = 0;
                let currentWarningPoints = 0;
                let currentTime = Math.round(Date.now() / 1000);


                if (warningPoints.length > 4) {
                    buttonRow
                        .addComponents(new ButtonBuilder()
                            .setCustomId('previousSiteWarnings')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️'))
                        .addComponents(new ButtonBuilder()
                            .setCustomId('nextSiteWarnings')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️'))
                }

                for (let i = 0; i < warningPoints.length; i++) {
                    lastPage = warningPoints.length / 5;
                    let element = warningPoints[i];
                    let user = (client.users.cache.get(element["warningPerson"])) ? client.users.cache.get(element["warningPerson"]).username : "Unbekannt"
                    let deletePerson = (client.users.cache.get(element["deleteUser"])) ? client.users.cache.get(element["deleteUser"]).username : "";
                    amountWarningPoints += element["warningPoints"];

                    if (element["expiryDate"] > currentTime) {
                        currentWarningPoints += element["warningPoints"];
                    }

                    if (i < 5) {
                        warnArray.push(
                            {
                                name: 'ID',
                                value: element["id"],
                                inline: true,
                            },
                            {
                                name: 'Punkte',
                                value: element["warningPoints"],
                                inline: true,
                            },
                            {
                                name: 'Grund',
                                value: element["reason"],
                                inline: true,
                            },
                            {
                                name: 'Ablauf',
                                value: timeConverter(element["expiryDate"]),
                                inline: true,
                            },
                            {
                                name: 'Verwarnt von',
                                value: user,
                                inline: true,
                            },
                            {
                                name: ' ',
                                value: ' ',
                                inline: true,
                            }
                        );
                    }
                }

                embedFields.push(
                    {
                        name: 'Anzahl Verwarnungen',
                        value: warningPoints.length,
                        inline: true,
                    },
                    {
                        name: 'Aktuelle Punkte:',
                        value: currentWarningPoints,
                        inline: true,
                    },
                    {
                        name: 'Punkte insgesamt:',
                        value: amountWarningPoints,
                        inline: true,
                    }
                );

                embedFields = embedFields.concat(warnArray);
            } else {
                embedFields.push(
                    {
                        name: 'Anzahl Verwarnungen',
                        value: 0,
                        inline: true,
                    },
                    {
                        name: 'Aktuelle Punkte',
                        value: 0,
                        inline: true,
                    },
                    {
                        name: 'Punkte insgesamt',
                        value: 0,
                        inline: true,
                    }
                );
            }

            const exampleEmbed = {
                color: 0x0099ff,
                title: 'Verwarnungen von: ' + client.users.cache.get(discordUserId).username,
                fields: embedFields,
                footer: {
                    text: `Seite ${currentPage} von ${Math.ceil(lastPage)}`
                }
            };
            */

            //#endregion
        } else if (interaction.options.getSubcommand() == 'delete') {
            let warningID = interaction.options.getInteger('id');
            let warnID = `ID#${warningID}`;
            let result;

            let checkId = await conn('SELECT id,discordUserID FROM `warningPoints` WHERE id = ?', [warningID]);

            if (checkId.length === 0) {
                result = `Verwarnung mit der ${inlineCode(warnID)} konnte nicht gefunden werden.`;
                await interaction.reply({
                    content: `Verwarnung mit der ${inlineCode(warnID)} konnte nicht gefunden werden.`,
                    ephemeral: true
                });
            } else {
                result = `Verwarnung mit der ${inlineCode(warnID)} wurde gelöscht von ${inlineCode(interaction.user.username)}.`;
                let currentTime = Math.round(Date.now() / 1000);
                await conn('UPDATE `warningPoints` SET warningPoints = 0,deleteUser = ?,deleteTime = ? WHERE ID = ?', [interaction.user.id, currentTime, warningID]);
                await refreshWarningPoints(checkId[0]["discordUserID"]);
                await interaction.reply({
                    content: `Verwarnung mit der ${inlineCode(warnID)} wurde gelöscht.`,
                    ephemeral: true
                });
            }

            await warnChannel.send({
                content: result
            });

        }
    }
}