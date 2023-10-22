const { support } = require("jquery");
const config = require("../../../../../Credentials/Config");

const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "ticket",
    type: ApplicationCommandType.ChatInput,
    description: "Erstelle ein Supportticket.",
    onlyRoles: [config.server.roles.teamRoleId],
    run: async (client, interaction) => {
        const supportLink = "https://support.innogames.com/kb/staemme/de_DE";

        const ticketMsg = new EmbedBuilder();
            ticketMsg
                .setTitle('Für In-Game Support klicke hier.')
                .setURL(supportLink)
                .setAuthor({
                    name: 'Die Stämme Discord Ticket System',
                    iconURL: `${interaction.guild.iconURL()}`
                })
                .setDescription('Hast du ein Problem mit dem Discord Server? Dann bist du hier genau richtig. Eröffne jetzt ein Ticket und beschreibe uns dein Anliegen. Besprich dein Problem mit einem unserer Mods in einem privaten Kanal.')
                .addFields([
                    {name: 'Klicke auf den Button, um ein Ticket zu eröffnen.', value: ' '},
                ])
                .setTimestamp()
                .setColor(0xED3D7D);

        await interaction.reply({
            content: '## Leider können wir hier keinen Support zu In-Game Problemen bieten! ',
            //content: '# Leider können wir hier keinen Support zu In-Game Problemen bieten! ',
            //content: '```ml\nLeider Ist Es Uns Nicht Erlaubt In-Game Support Auf Discord Zu Bieten\n```',
            //content: '```diff\n- Leider können wir hier keinen Support zu In-Game Problemen bieten!\n```',
            embeds: [ticketMsg],
            components: [
                new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket')
                        .setLabel('Ticket erstellen')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🏷')
                )
            ],
        });
    }
}