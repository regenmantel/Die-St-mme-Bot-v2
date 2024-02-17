const config = require('../../Credentials/Config');
const { conn } = require('../../functions/conn');
const { log } = require('../../functions/log');
const talkedRecently = new Set();

const { inlineCode, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'event',
	run: async (client, interaction) => {
		const currentTicketId = await conn('SELECT MAX(id) FROM `events`');

		let maxId = currentTicketId[0]['MAX(id)'];
		let newId = maxId + 1;
		await conn('INSERT INTO `events` (id, discordUserName, discordUserId) VALUES (?,?,?)', [newId, interaction.user.username, interaction.user.id]);
		await interaction.reply({
			content: `🎉 Du hast dich erfolgreich für das Gewinnspiel angemeldet. 🎉`,
			ephemeral: true,
		});
	},
};
