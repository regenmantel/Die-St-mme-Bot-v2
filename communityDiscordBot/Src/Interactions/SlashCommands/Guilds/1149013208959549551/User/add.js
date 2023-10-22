const fs = require('fs');
const path = require('path');
const config = require("../../../../../Credentials/Config");

const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "add",
    description: "Füge etwas hinzu.",
    onlyRoles: [config.server.roles.teamRoleId],
    options: [
        {
            name: "insult",
            type: 1,
            description: "Füge eine Beleidigung hinzu.",
            options: [
                {
                    name: "insult",
                    type: 3,
                    description: "Beleidigung",
                    required: true,
                }
            ]
        },
        {
            name: "quiz",
            type: 1,
            description: "Füge eine neue Frage hinzu.",
            options: [
                {
                    name: "question",
                    type: 3,
                    description: "Frage",
                    required: true,
                },
                {
                    name: "answer",
                    type: 3,
                    description: "Antwort.",
                    required: true,
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'insult') {
            if (interaction.options.getString('insult')) {
                let insult = interaction.options.getString('insult');
                fs.appendFile(path.resolve(__dirname,'../../../../../assets/list/schimpfwortliste.txt'), "\n"+insult, async (err) => {
                    if (err) {
                        await interaction.reply({
                            content: `Etwas ist schief gelaufen. Bitte informiere die Entwickler.`,
                            ephemeral: true
                        })
                    } else {
                        await interaction.reply({
                            content: `"${insult}" wurde als Beleidigung hinzugefügt.`,
                            ephemeral: true
                        })
                    }
                });
            }
        }else if (interaction.options.getSubcommand() === 'quiz') {
            let question = interaction.options.getString('question');
            let answer = interaction.options.getString('answer');
            let insert = question + ", " + answer;
            fs.appendFile(path.resolve(__dirname,'../../../../../assets/list/Questions.txt'), "\n" + insert, async (err) => {
                if (err) {
                    await interaction.reply({
                        content: `Etwas ist schief gelaufen. Bitte informiere die Entwickler.`,
                        ephemeral: true
                    })
                } else {
                    await interaction.reply({
                        content: `"${question}" wurde als Frage hinzugefügt.`,
                        ephemeral: true
                    })
                }
            });
        }
    }
}
