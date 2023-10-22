const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");

const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "profil",
    description: "Ändere dein Server-Profil an.",
    options: [
        {
            name: "link",
            type: 1,
            description: "Verlinke dein IG-Profil an.",
        },
        {
            name: "birthday",
            type: 1,
            description: "Trage deinen Geburtstag in deinen Profil ein.",
        },
        {
            name: "show",
            type: 1,
            description: "Seh dir ein Server-Profil an.",
            options: [
                {
                    name: "user",
                    type: 6,
                    description: "Username",
                }
            ]
        },
        {
            name: "remove",
            type: 1,
            description: "Entferne deinen IG-Account.",
        }
    ],
    run: async (client, interaction) => {
        let embedURL = '';
        let field = [];

        if (interaction.options.getSubcommand() === 'link') {
            const modal = new ModalBuilder()
                .setCustomId('linkProfile')
                .setTitle(`Verbinde deinen In-Game Account!`)

            const inGameAccount = new TextInputBuilder()
                .setCustomId('account')
                .setLabel('In-Game Account')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(50)
                .setPlaceholder('z.B: catonbook')
                .setRequired(true)
            /* const birthday = new TextInputBuilder()
                .setCustomId('birthday')
                .setLabel('Geburtstag')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(50)
                .setPlaceholder('z.B: 26.05.1999')
                .setRequired(false) */

            const inGameAccountRow = new ActionRowBuilder().addComponents(inGameAccount);
            /* const birthdayRow = new ActionRowBuilder().addComponents(birthday); */

            modal.addComponents(inGameAccountRow, /* birthdayRow */);
            await interaction.showModal(modal);
        } else if (interaction.options.getSubcommand() === 'show') {
            if (!interaction.options.getUser('user')) {
                const discordUserInfo = await conn('SELECT * FROM `users` WHERE discordUserId = ?', [interaction.user.id]);
                const user = client.users.cache.get(discordUserInfo[0]['discordUserId']);
                const member = interaction.guild.members.cache.get(discordUserInfo[0]['discordUserId']);
                const warningPoints = discordUserInfo[0]["warningPoints"];
                const ticketAmount = discordUserInfo[0]["ticketAmount"];
                //const activityPoints = discordUserInfo[0]["activityPoints"];
                const level = discordUserInfo[0]["level"];
                const messagesSent = discordUserInfo[0]["messagesSent"];
                const reactions = discordUserInfo[0]["reactionsReceived"];
                const reactionsSend = discordUserInfo[0]["reactionsSent"];

                let inGameAccount = discordUserInfo[0]["inGameAccount"];

                if (inGameAccount === '') {
                    inGameAccount = 'Kein Account gefunden.';
                    embedURL = `https://ds-ultimate.de`;
                } else {
                    embedURL = `https://ds-ultimate.de/search/de/player/${inGameAccount}`;
                }
                embedURL = embedURL.replaceAll(" ","%20");

                const memberRoles = member.roles.cache
                    .filter((role) => role.name != '@everyone')
                    .map(role => `<@&${role.id}>`);

                field.push(
                    {name: 'Name', value: `${user.username}`, inline: true},
                    {name: 'Rollen', value: `${memberRoles.join(', ')}`, inline: true},
                    {name: 'Level', value: `${level}`, inline: true},
                    {name: 'Aktuelle Verwarnpunkte', value: `${warningPoints}`, inline: true},
                    {name: 'Tickets erstellt', value: `${ticketAmount}`, inline: true},
                    {name: 'Nachrichten gesendet', value: `${messagesSent}`, inline: true},
                    {name: 'Reaktionen erhalten', value: `${reactions}`, inline: true},
                    {name: 'Reaktionen gesendet', value: `${reactionsSend}`, inline: true},
                )

                const profilMsg = {
                    title: "DS-Ultimate",
                    url: embedURL,
                    author: {
                        name: 'Die Stämme Discord Profil',
                        iconURL: `${interaction.guild.iconURL()}`
                    },
                    description: `In-Game Account: ${inGameAccount}`,
                    thumbnail: {url: user.displayAvatarURL({dynamic: true, format: 'png', size: 1024})},
                    fields: field,
                    timestamp: new Date(),
                    color: 0xED3D7D
                };

                await interaction.reply({
                    embeds: [profilMsg],
                    ephemeral: true
                });
            } else {
                const discordUserInfo = await conn('SELECT * FROM `users` WHERE discordUserId = ?', [interaction.options.getUser('user').id]);
                const user = client.users.cache.get(discordUserInfo[0]['discordUserId']);
                const member = interaction.guild.members.cache.get(discordUserInfo[0]['discordUserId']);
                const warningPoints = discordUserInfo[0]["warningPoints"];
                const ticketAmount = discordUserInfo[0]["ticketAmount"];
                //const activityPoints = discordUserInfo[0]["activityPoints"];
                const level = discordUserInfo[0]["level"];
                const messagesSent = discordUserInfo[0]["messagesSent"];
                let inGameAccount = discordUserInfo[0]["inGameAccount"];
                const reactions = discordUserInfo[0]["reactionsReceived"];
                const reactionsSend = discordUserInfo[0]["reactionsSent"];

                if (inGameAccount === '') {
                    inGameAccount = 'Kein Account gefunden.';
                    embedURL = `https://ds-ultimate.de`;
                } else {
                    embedURL = `https://ds-ultimate.de/search/de/player/${inGameAccount}`;
                }
                embedURL = embedURL.replaceAll(" ","%20");
                const memberRoles = member.roles.cache
                    .filter((role) => role.name != '@everyone')
                    .map(role => `<@&${role.id}>`);

                field.push(
                    {name: 'Name', value: `${user.username}`, inline: true},
                    {name: 'Rollen', value: `${memberRoles.join(', ')}`, inline: true},
                    {name: 'Level', value: `${level}`, inline: true},
                )

                if (interaction.member.roles.cache.has(config.server.roles.teamRoleId)) {
                    field.push(
                        {name: 'Tickets erstellt', value: `${ticketAmount}`, inline: true},
                        {name: 'Aktuelle Verwarnpunkte', value: `${warningPoints}`, inline: true}
                    )
                }

                field.push(
                    {name: 'Nachrichten gesendet', value: `${messagesSent}`, inline: true},
                    {name: 'Reaktionen erhalten', value: `${reactions}`, inline: true},
                    {name: 'Reaktionen gesendet', value: `${reactionsSend}`, inline: true},
                    //{name: 'Aktivitätspunkte', value: `${discordUserInfo[0]["activityPoints"]}`, inline: true},
                    //{name: 'Geburtstag', value: `${timeConverter(discordUserInfo[0]["birthday"])}`, inline: true},
                )

                const profilMsg = {
                    title: "DS-Ultimate",
                    url: embedURL,
                    author: {
                        name: 'Die Stämme Discord Profil',
                        iconURL: `${interaction.guild.iconURL()}`
                    },
                    description: `In-Game Account: ${inGameAccount}`,
                    thumbnail: {url: user.displayAvatarURL({dynamic: true, format: 'png', size: 1024})},
                    fields: field,
                    timestamp: new Date(),
                    color: 0xED3D7D
                };

                await interaction.reply({
                    embeds: [profilMsg],
                    ephemeral: true
                });
            }
        } else if (interaction.options.getSubcommand() === 'remove') {
            await conn('UPDATE `users` SET inGameAccount = "" WHERE discordUserId = ?', [interaction.user.id]);
            await interaction.reply({
                content: 'Dein In-Game Account wurde aus deinem Discord Profil entfernt.',
                ephemeral: true
            });
        } else if (interaction.options.getSubcommand() === 'birthday') {
            const modal = new ModalBuilder()
                .setCustomId('birthday')
                .setTitle(`Trage deinen Geburtstag in deinen Profil ein!`)

            const day = new TextInputBuilder()
                .setCustomId('day')
                .setLabel('Tag')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(50)
                .setPlaceholder('z.B: 26')
                .setRequired(true)
            const month = new TextInputBuilder()
                .setCustomId('month')
                .setLabel('Monat')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(50)
                .setPlaceholder('z.B: 5')
                .setRequired(true)
            const year = new TextInputBuilder()
                .setCustomId('year')
                .setLabel('Jahr')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(50)
                .setPlaceholder('z.B: 1999')
                .setRequired(true)

            const dayRow = new ActionRowBuilder().addComponents(day);
            const monthRow = new ActionRowBuilder().addComponents(month);
            const yearRow = new ActionRowBuilder().addComponents(year);

            modal.addComponents(dayRow, monthRow, yearRow);
            await interaction.showModal(modal);
        }
    }
}
