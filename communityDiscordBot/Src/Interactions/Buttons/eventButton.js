const { conn } = require('../../functions/conn');

module.exports = {
	name: 'event',
	run: async (client, interaction) => {
		const currentTicketId = await conn('SELECT MAX(id) FROM `events`');

		await conn('INSERT INTO `events` (discordUserName, discordUserId) VALUES (?,?)', [interaction.user.username, interaction.user.id]);
		await interaction.reply({
			content: `🎉 Du hast dich erfolgreich für das Gewinnspiel angemeldet. 🎉`,
			ephemeral: true,
		});
	},
};
