const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const createdReport = new Set();

const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    channelMention
} = require("discord.js");

module.exports = {
    name: "report",
    description: "Melde eine Spielernachricht.",
    options: [
        {
            name: "messagelink",
            type: 3,
            description: "Bitte kopiere hier den Link der Nachricht hinein.",
            required: true
        },
        {
            name: "usermessage",
            type: 3,
            description: "Teile uns mit was der Grund deines reports ist.",
            required: true
        }
    ],
    run: async (client, interaction) => {

        if (createdReport.has(interaction.user.id)) {
            await interaction.reply({
                content: `"Du kannst nur alle 5 Minuten ein Report erstellen.`,
                ephemeral: true
            })
            return;
        }

        let messageLink = interaction.options.getString('messagelink');
        let userMessage = interaction.options.getString('usermessage');

        const warnChannel = interaction.guild.channels.cache.get(config.server.channels.warnChannelId);
        let realMessage = false;
        const newReport = new EmbedBuilder();

        if (messageLink) {
            const regex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/g;
            let match, channelID, messageID;

            while (match = regex.exec(messageLink)) {
                channelID = match[1];
                messageID = match[2];
            }


            const channel = await client.channels.cache.get(channelID);
            if (channel) {
                await channel.messages.fetch(messageID)
                    .then(async (message) => {
                        realMessage = true;
                        let messageContent = message.content;
                        if (message.attachments.size) {
                            messageContent += "\nAnhang:";
                            message.attachments.forEach((attachment) => {
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

                        await newReport
                            .setTitle(`Reportmeldung von ${interaction.user.username}`)
                            .setThumbnail(message.author.displayAvatarURL({dynamic: true, format: 'png', size: 1024}))
                            .addFields([
                                {name: 'Name', value: `${message.author}`, inline: true},
                                {name: 'Channel', value: `${message.url}`, inline: true},
                                {name: 'Nachricht', value: `${messageContent}`},
                                {name: 'User Nachricht', value: `${userMessage}`}
                            ])
                            .setTimestamp()
                            .setColor(0xED3D7D);

                    })
                    .catch(error => {
                    });
            }
        }

        if (realMessage) {
            await warnChannel.send({
                embeds: [newReport],
                content: `:eyes: <@&${config.server.roles.discordModRoleId}>`,
                components: [
                    new ActionRowBuilder().setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('suggestion')
                            .setPlaceholder('Wähle eine Strafe aus.')
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Unpassender Beitrag')
                                    .setDescription('1h Timeout')
                                    .setValue('13'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Unpassender Beitrag')
                                    .setDescription('12h Timeout')
                                    .setValue('14'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Unpassender Beitrag')
                                    .setDescription('1 Punkt 30 Tage')
                                    .setValue('0'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Leichte Beleidigung')
                                    .setDescription('2 Punkte 30 Tage')
                                    .setValue('1'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Nicht beachten einer Moderatoren Anweisung')
                                    .setDescription('3 Punkte 30 Tage')
                                    .setValue('2'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Beleidigung')
                                    .setDescription('5 Punkte 30 Tage')
                                    .setValue('3'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Werbung')
                                    .setDescription('5 Punkte 30 Tage')
                                    .setValue('4'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Extreme Beleidigung')
                                    .setDescription('10 Punkte 30 Tage')
                                    .setValue('5'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Wiederholtes Ignorieren einer Moderatorenanweisung')
                                    .setDescription('10 Punkte 30 Tage')
                                    .setValue('6'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Wiederholt Werbung')
                                    .setDescription('10 Punkte 30 Tage')
                                    .setValue('7'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Verbreitung von unerlaubten Scripten/Bots')
                                    .setDescription('10 Punkte 30 Tage')
                                    .setValue('8'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Dauerhaft unangebrachte Beiträge')
                                    .setDescription('Dauerhaft gesperrt')
                                    .setValue('9'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Politisch extreme Inhalte')
                                    .setDescription('Dauerhaft gesperrt')
                                    .setValue('10'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Unpassendes Bildmaterial')
                                    .setDescription('Dauerhaft gesperrt')
                                    .setValue('11'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Doxing')
                                    .setDescription('Dauerhaft gesperrt')
                                    .setValue('12'),
                            )
                    ),
                    new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId('ignore')
                            .setLabel('Ignorieren')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🗑️'),
                        new ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel('Nachricht löschen')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🗑️'),
                        new ButtonBuilder()
                            .setCustomId('warn')
                            .setLabel('Spieler warnen')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('⚠️')
                    )
                ]
            })
            interaction.reply({
                content: `Die Nachricht wurde reported.`,
                ephemeral: true,
            })
        } else {
            interaction.reply({
                content: `Bitte fügen einen gültigen Nachrichtenlink ein.`,
                ephemeral: true,
            })
        }

        createdReport.add(interaction.user.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            createdReport.delete(interaction.user.id);
        }, 60000 * 5);
    }
}