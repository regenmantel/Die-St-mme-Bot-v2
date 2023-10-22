const config = require('../Credentials/Config');
const {log} = require('./log');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const {del} = require('request');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    channelMention
} = require('discord.js');

module.exports = {
    name: 'insultFilter',
    run: async (client, message) => {
        if (message.author.bot) {
            return;
        }
        let array = fs.readFileSync(path.resolve(__dirname, '../assets/list/schimpfwortliste.txt'), 'utf8').toString().split("\n");
        array = array.map(string => string.replaceAll('\r', '').toLowerCase());
        let res = array.filter(n => message.content.toLowerCase().includes(n));

        if (res.length && !message.author.bot) {
            const warnChannel = message.guild.channels.cache.get(config.server.channels.warnChannelId);
            let roleID = config.server.roles.discordModRoleId;

            const warningPoints = await conn('SELECT warningPoints FROM `users` WHERE discordUserId = ?', [message.author['id']]);
            const newInsult = new EmbedBuilder();
            if (message.attachments.length) {
                message.content += "\nAnhang:";
                message.attachments.forEach((attachment) => {
                    message.content += `\n${attachment.url}`
                })
            }
            newInsult
                .setTitle('Beleidigungsfilter')
                .setThumbnail(message.author.displayAvatarURL({dynamic: true, format: 'png', size: 1024}))
                .addFields([
                    {name: 'Name', value: `${message.author}`, inline: true},
                    {name: 'Channel', value: `${message.url}`, inline: true},
                    {name: 'Verwarnpunkte', value: `${warningPoints[0]['warningPoints']}`},
                    {name: 'Nachricht', value: `${message.content}`},
                    {name: 'Beleidigung', value: `${res[0]}`}
                ])
                .setTimestamp()
                .setColor(0xED3D7D);

            await warnChannel.send({
                embeds: [newInsult],
                content: `:eyes: <@&${roleID}>`,
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
                ],
            });
        } else {
            return;
        }
    },
};

async function conn(query, args) {
    return new Promise(resolve => {
        let conn = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database,
            port: config.mysql.port
        });
        conn.execute(
            query,
            args,
            async function (err, results, fields) {
                resolve(results)
                await conn.end();
                await conn.destroy();
            });
    });
}