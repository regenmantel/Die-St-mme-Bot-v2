const { conn } = require('../../functions/conn');

module.exports = {
	name: 'event',
	run: async (client, interaction) => {
		await interaction.reply({
			content: `🎉 Das Gewinnspiel ist zu Ende. Wir freuen uns schon auf das nächste! 🎉`,
			ephemeral: true,
		});
	},
};
