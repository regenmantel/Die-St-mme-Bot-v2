const config = require('../Credentials/Config');
const cooldownDuration = 60000; // 60 Sek
const cooldowns = {};
const {conn} = require("./conn");

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: 'activityPoints',
    run: async (client, message) => {
        if (message.author.bot) {
            return;
        }

        const userId = message.author.id;

        if (cooldowns[userId] && cooldowns[userId] > Date.now()) {
            return;
        } else {
            cooldowns[userId] = Date.now() + cooldownDuration;
            let removeRole, addRole, level;

            const pointsQuery = await conn('SELECT activityPoints FROM `users` WHERE discordUserId = ?', [message.author.id])
            let points = pointsQuery.length ? pointsQuery[0]['activityPoints'] : 0;

            if (points >= 1 && points < 25) {
                level = 'Speerträger (Level 1)';
                removeRole = config.server.activity.spaeher;
                addRole = config.server.activity.speertraeger;
            } else if (points >= 25 && points < 50) {
                level = 'Bogenschütze (Level 2)';
                removeRole = config.server.activity.speertraeger;
                addRole = config.server.activity.bogenschuetze;
            } else if (points >= 50 && points < 100) {
                level = 'Axtkämpfer (Level 3)';
                removeRole = config.server.activity.bogenschuetze;
                addRole = config.server.activity.axtkaempfer;
            } else if (points >= 100 && points < 150) {
                level = 'Berittener Bogenschütze (Level 4)';
                removeRole = config.server.activity.axtkaempfer;
                addRole = config.server.activity.beritteneBogen;
            } else if (points >= 150 && points < 250) {
                level = 'Leichte Kavallerie (Level 5)';
                removeRole = config.server.activity.beritteneBogen;
                addRole = config.server.activity.leichteKavallerie;
            } else if (points >= 250 && points < 500) {
                level = 'Rammbock (Level 6)';
                removeRole = config.server.activity.leichteKavallerie;
                addRole = config.server.activity.rammbock;
            } else if (points >= 500 && points < 800) {
                level = 'Katapult (Level 7)';
                removeRole = config.server.activity.rammbock;
                addRole = config.server.activity.katapult;
            } else if (points >= 800 && points < 1200) {
                level = 'Schwere Kavallerie (Level 8)';
                removeRole = config.server.activity.katapult;
                addRole = config.server.activity.schwereKavallerie;
            } else if (points >= 1200 && points < 2500) {
                level = 'Paladin (Level 9)';
                removeRole = config.server.activity.schwereKavallerie;
                addRole = config.server.activity.paladin;
            } else if (points >= 2500) {
                level = 'Adelsgeschlecht (Level 10)';
                removeRole = config.server.activity.paladin;
                addRole = config.server.activity.adelsgeschlecht;
            }
            if (removeRole && addRole && level) {
                await conn('UPDATE users SET activityPoints = activityPoints + 1, level = ? WHERE discordUserId = ?', [level, message.author.id]);
                try {
                    await message.member.roles.remove(message.member.guild.roles.cache.find(role => role.id === removeRole));
                    await message.member.roles.add(message.member.guild.roles.cache.find(role => role.id === addRole));
                } catch (e) {

                }
            }
        }
    },
};
