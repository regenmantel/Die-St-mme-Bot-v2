const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {log} = require('../../functions/log');
const talkedRecently = new Set();

const {
    inlineCode,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField,
} = require('discord.js');

module.exports = {
    name: "ticket",
    run: async (client, interaction) => {

        if (talkedRecently.has(interaction.user.id)) {
            await interaction.reply({
                content: `"Du kannst nur alle 5 Minuten ein Ticket erstellen.`,
                ephemeral: true
            })
            return;
        }
        const ticketChannel = interaction.guild.channels.cache.get(config.server.channels.ticketChannelId);
        const currentTicketId = await conn('SELECT MAX(ticketId) FROM `tickets`');
        
        let maxTicketId = currentTicketId[0]['MAX(ticketId)'];
        let newTicketId = maxTicketId + 1;

        const channelName = `${newTicketId.toString().padStart(4, '0')}-dssupport`;
        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: '1152253366269919313',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        });

        const newChannel = new EmbedBuilder();
            newChannel
                .setTitle('Die Stämme Discord Ticket System')
                .setAuthor({
                    name: `Ticket ${inlineCode(channelName)} von ${interaction.user.username}`,
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription('Willkommen in deinen persönlichen Supportkanal. Wie können wir dir behilflich sein?')
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

        const ticketAmountOfCreatorId = await conn('SELECT ticketAmount FROM `users` WHERE discordUserId = ?', [interaction.user.id]);
        const oldTicketAmount = ticketAmountOfCreatorId[0]['ticketAmount'];
        let newTicketAmount = oldTicketAmount + 1;

        await conn('UPDATE `users` SET ticketAmount = ? WHERE discordUserId = ?', [newTicketAmount, interaction.user.id]);

        talkedRecently.add(interaction.user.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            talkedRecently.delete(interaction.user.id);
        }, 60000*5);
    }
};