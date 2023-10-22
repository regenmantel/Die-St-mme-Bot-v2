const config = require('../../Credentials/Config');
const {conn} = require('../../functions/conn');
const {log} = require('../../functions/log');

const {
    inlineCode,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

module.exports = {
    name: "close",
    run: async (client, interaction) => {
        const ticketChannel = interaction.guild.channels.cache.get(config.server.channels.ticketChannelId);
        const channelId = interaction.channelId;
        const channel = interaction.guild.channels.cache.get(channelId);
        const ticketArchiev = config.server.categorys.ticketArchiv;

        let channelCount = 0;
        let lastChannel;

        interaction.guild.channels.cache.forEach((channell) => {
            if (channell.parentId === ticketArchiev) {
                channelCount++;
                if (!lastChannel) {
                    lastChannel = channell;
                } else {
                    if (channell.createdTimestamp < lastChannel.createdTimestamp) {
                        lastChannel = channell;
                    }
                }
            }
        });
        await delay(300);
        if (channelCount >= 50 && lastChannel.id) {
            let messagesFromChannel = [];
            let getLastChannel = client.channels.cache.get(lastChannel.id);
            getLastChannel.messages.fetch({limit: 100}).then(async messages => {
                messages.forEach((message) => {
                    if (message.author.globalName) {
                        messagesFromChannel.push(
                            {
                                author: message.author.globalName,
                                authorID: message.author.id,
                                content: message.content
                            }
                        )
                    }
                })
                let timestamp = Math.round(Date.now() / 1000);
                let jsonMessages = JSON.stringify(messagesFromChannel);
                await conn("INSERT INTO `ticketArchiv` (ticketName,ticketMessages,timestamp) VALUES (?,?,?)", [lastChannel.name, jsonMessages, timestamp])
                lastChannel.delete()
            })
        }

        if (channel) {
            const ticketCreatorQuery = await conn('SELECT discordUserId, ticketId FROM `tickets` WHERE channelId = ?', [interaction.channelId]);
            const ticketCreatorId = ticketCreatorQuery[0]['discordUserId'];
            const ticketId = ticketCreatorQuery[0]['ticketId'];
            const user = client.users.cache.get(ticketCreatorId);

            await ticketChannel.send(`:closed_lock_with_key: · Das Ticket ${inlineCode(channel.name)} wurde geschlossen von ${interaction.user} ➙ Archiviert: <#${channel.id}>`);


            const userPN = new EmbedBuilder();
            userPN
                .setTitle(`Die Stämme Discord Bot - Ticket ID#${ticketId}`)
                .setAuthor({
                    name: 'Die Stämme Discord Profil',
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription(`Dein Ticket ${inlineCode(channel.name)} wurde von ${interaction.user} geschlossen. Wir hoffen, wir konnten dir weiterhelfen.`)
                .setThumbnail(user.displayAvatarURL({dynamic: true, format: 'png', size: 1024}))
                .setFooter({text: `Die Stämme Discord Team`})
                .setTimestamp()
                .setColor(0xED3D7D);

            try {
                await user.send({
                    embeds: [userPN]
                });
            } catch (e) {

            }


            await interaction.message.edit({
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close')
                            .setLabel('Ticket Schließen')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🔐')
                            .setDisabled(true),
                    )
                ]
            });

            await interaction.reply({
                content: `Ticket wurde geschlossen von ${inlineCode(interaction.user.username)}.`
            });

            await channel.edit({
                name: channel.name,
                parent: ticketArchiev,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            });

            await conn('UPDATE `tickets` SET status = ? WHERE channelId = ?', [1, channelId]);
        } else {
            await interaction.reply({
                content: `Error: Tut mir leid, ich kann den Text-Kanal leider nicht archivieren. Kontaktiere bitte ein Team Mitglied.`,
                ephemeral: true
            });
        }
    }
};

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}