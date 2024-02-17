const { support } = require('jquery');
const config = require('../../../../../Credentials/Config');

const { ApplicationCommandType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'event',
	type: ApplicationCommandType.ChatInput,
	description: 'Eventcommand mit Button',
	onlyRoles: [config.server.roles.teamRoleId],
	run: async (client, interaction) => {
		const ticketMsg = new EmbedBuilder()
			.setTitle('🎉 1000 Discord Mitglieder 🎉')
			.setAuthor({
				name: 'Die Stämme Discord Gewinnspiel',
				iconURL: `${interaction.guild.iconURL()}`,
			})
			.setDescription(
				'Zur Feier von 1000 Discord Mitglieder wollen wir mit euch ein kleines Gewinnspiel machen. \n\nWir möchten unter euch 5x 200 Premium Punkte verlosen. Alles, was ihr für die Teilnahme tun müsst, ist auf Teilnehmen zu drücken. \n\nJeder User kann nur einmal teilnehmen! Die 5. Gewinner werden am 1. März 2024 per Zufallsprinzip ausgelost. \n\nViele Grüße\nEuer Stämme-Team',
			)
			.setTimestamp()
			.setColor(0xed3d7d);

		await interaction.reply({
			embeds: [ticketMsg],
			components: [new ActionRowBuilder().setComponents(new ButtonBuilder().setCustomId('event').setLabel('Teilnehmen').setStyle(ButtonStyle.Primary).setEmoji('✅'))],
		});
	},
};
