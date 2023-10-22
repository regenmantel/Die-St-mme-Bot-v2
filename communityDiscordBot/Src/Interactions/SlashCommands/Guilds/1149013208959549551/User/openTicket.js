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
    ButtonStyle, ChannelType, PermissionsBitField
} = require("discord.js");

module.exports = {
    name: "openticket",
    description: "Erstelle ein Ticket mit einem oder mehreren Spielern.",
    onlyRoles: [config.server.roles.teamRoleId],
    options: [
        {
            name: "users",
            type: 3,
            description: "@user",
            required: true
        }
    ],
    run: async (client, interaction) => {
        let userArray = [];
        let users = interaction.options.getString('users')
        const regex = /<@(?<id>\d+)>/g;
        let match;

        while (match = regex.exec(users)) {
            userArray.push(match.groups["id"]);
        }

        if (userArray.length) {
            const ticketChannel = interaction.guild.channels.cache.get(config.server.channels.ticketChannelId);
            const currentTicketId = await conn('SELECT MAX(ticketId) FROM `tickets`');

            let maxTicketId = currentTicketId[0]['MAX(ticketId)'];
            let newTicketId = maxTicketId + 1;

            const channelName = `${newTicketId.toString().padStart(4, '0')}-dssupport`;
            let permissionsUserArray = [{
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            }]
            userArray.forEach((user) => {
                permissionsUserArray.push(
                    {
                        id: user,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                )
            })

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: config.server.categorys.tickets,
                permissionOverwrites: permissionsUserArray,
            });


            const newChannel = new EmbedBuilder();
            newChannel
                .setTitle('Die Stämme Discord Ticket System')
                .setAuthor({
                    name: `Ticket ${inlineCode(channelName)} von ${interaction.user.username}`,
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription('Willkommen in deinen persönlichen Supportkanal.')
                .setTimestamp()
                .setColor(0xED3D7D);

            await channel.send({
                embeds: [newChannel],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close')
                            .setLabel('Ticket Schließen')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🔐'),
                    )
                ],
                ephemeral: true
            });

            await ticketChannel.send(`🏷 Es wurde ein neues Ticket ${inlineCode(channelName)}  erstellt von ${interaction.user} ➙  <#${channel.id}>`)
            await interaction.reply({
                content: `🏷 Ein Ticket ${inlineCode(channelName)} wurde automatisch für dich hier erstellt ➙  <#${channel.id}>`,
                ephemeral: true
            });

            await conn('INSERT INTO `tickets` VALUES (?,?,?,?)', [newTicketId, interaction.user.id, channel.id, 0]);

        } else {
            await interaction.reply({
                content: `🏷 Du musst Leute verlinken.. 🏷`,
                ephemeral: true
            });
        }


    }
}