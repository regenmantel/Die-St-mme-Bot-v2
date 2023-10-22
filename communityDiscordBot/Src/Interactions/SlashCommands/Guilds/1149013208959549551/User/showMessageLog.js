const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");

const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    inlineCode,
    time
} = require("discord.js");

module.exports = {
    name: "log",
    description: "Zeigt dir einen Log an.",
    onlyRoles: [config.server.roles.teamRoleId],
    options: [
        {
            name: "messagearchive",
            type: 1,
            description: "Zeigt dir gelöschte Nachrichten an.",
            options: [
                {
                    name: "time",
                    type: 4,
                    description: "Zeit in Stunden",
                    required: true
                }
            ],
        },
        {
            name: "changemessages",
            type: 1,
            description: "Zeigt dir den Verlauf einer bearbeiten Nachricht an.",
            options: [
                {
                    name: "messagelink",
                    type: 3,
                    description: "Nachrichtenlink",
                    required: true
                }
            ],
        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() == 'messagearchive') {
            let days = interaction.options.getInteger('time');
            days = Math.round(Date.now() / 1000) - days * 86400;
            let log = await conn("SELECT * FROM `messageArchiv` WHERE timestamp > ?", [days]);
            if (log.length) {
                let content = "";
                for (const element of log) {
                    const date = new Date(element["timestamp"]*1000);
                    const timeString = time(date);
                    let messagePerson = (await client.users.cache.get(element["discordUserID"])) ? await client.users.cache.get(element["discordUserID"]).username : "Unbekannt";
                    let channelName = element["channelName"];
                    let deleteMessage = element["messageContent"];
                    content += `Channel: ${inlineCode(channelName)} | User: ${inlineCode(messagePerson)} | Nachricht: ${inlineCode(deleteMessage)} | Uhrzeit ${timeString}\n`;
                }
                interaction.reply({
                    content: content,
                    ephemeral: true,
                })
            } else {
                interaction.reply({
                    content: "Keine Nachrichten gefunden.",
                    ephemeral: true,
                })
            }
        } else if (interaction.options.getSubcommand() == 'changemessages') {
            let realMessage = false;
            let messageLink = interaction.options.getString("messagelink");
            const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
            let match, channelID, messageID, changedMessage, messageContent = "";

            while (match = regex.exec(messageLink)) {
                channelID = match[1];
                messageID = match[2];
            }
            const channel = await client.channels.cache.get(channelID);
            if (channel) {
                await channel.messages.fetch(messageID)
                    .then(async (message) => {
                        realMessage = true;
                        changedMessage = await conn("SELECT * FROM `changeMessageArchiv` WHERE channelID = ? AND messageID = ?", [channelID, messageID]);
                        if (changedMessage.length) {
                            changedMessage.forEach((element) => {
                                const date = new Date(element["timeunix"]*1000);
                                const timeString = time(date);
                                messageContent += `alte Nachricht: ${inlineCode(element["oldMessage"])} | neue Nachricht: ${inlineCode(element["newMessage"])} | Änderungszeit : ${timeString} \n`;
                            })
                        } else {
                            messageContent += "Nachricht wurde nicht bearbeitet."
                        }
                    })
                    .catch(Error);
            }
            if(realMessage){
                interaction.reply({
                    content: messageContent,
                    ephemeral: true,
                })
            }else{
                interaction.reply({
                    content: "Nachricht nicht gefunden.",
                    ephemeral: true,
                })
            }

        }
    }
}
