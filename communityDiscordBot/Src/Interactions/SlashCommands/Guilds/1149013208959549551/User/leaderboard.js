const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");
const {refreshWarningPoints} = require("../../../../../functions/refreshWarningPoints");

const {
    inlineCode,
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
    name: "leaderboard",
    description: "Sieh dir die Top 10 am jeweiligen Leaderboard an.",
    options: [
        {
            name: "kategorie",
            type: 3,
            description: "Top 10 mit den meisten Reactions.",
            required: true,
            choices: [
                {
                    name: 'Reaktionen',
                    value: 'reactions',
                },
                {
                    name: 'Nachrichten',
                    value: 'messages',
                },
                {
                    name: 'Quiz',
                    value: 'quiz',
                },
                {
                    name: 'Top reagierte Nachrichten',
                    value: 'mostReactedMessages',
                },
            ]
        }
    ],
    run: async (client, interaction) => {
        const discordUserId = interaction.user.id;
        const rankEmoji = [':first_place:', ':second_place:', ':third_place:'];
        let msg = "";

        if (interaction.options.getString("kategorie") === 'reactions') {
            let leaderBoardReactions = await conn("SELECT discordUserId,reactionsReceived FROM `users` ORDER by reactionsReceived DESC LIMIT 10;");

            if (leaderBoardReactions.length) {
                let i = 1;

                leaderBoardReactions.forEach((element) => {
                    let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
                    let reactions = element["reactionsReceived"];

                    msg += `${rankEmoji[i - 1] ? rankEmoji[i - 1]: "🏅"} Rang ${i}: ${inlineCode(reactionPerson)} mit ${inlineCode(reactions)} Reactions.\n`;
                    i++;
                });
            }
        } else if(interaction.options.getString("kategorie") === 'messages') {
            let leaderBoardMessage = await conn("SELECT discordUserId,messagesSent FROM `users` ORDER by messagesSent DESC LIMIT 10;");

            if (leaderBoardMessage.length) {
                let i = 1;

                leaderBoardMessage.forEach((element) => {
                    let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
                    let messages = element["messagesSent"];

                    msg += `${rankEmoji[i - 1] ? rankEmoji[i - 1]: "🏅"} Rang ${i}: ${inlineCode(reactionPerson)} mit ${inlineCode(messages)} Nachrichten.\n`;
                    i++;
                });
            }
        } else if(interaction.options.getString("kategorie") === 'quiz') {
            let leaderBoardQuiz = await conn("SELECT discordUserId,quizRightAnswer FROM `users` ORDER by quizRightAnswer DESC LIMIT 10;");

            if (leaderBoardQuiz.length) {
                let i = 1;

                leaderBoardQuiz.forEach((element) => {
                    let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
                    let quizRightAnswer = element["quizRightAnswer"];

                    msg += `${rankEmoji[i - 1] ? rankEmoji[i - 1]: "🏅"} Rang ${i}: ${inlineCode(reactionPerson)} mit ${inlineCode(quizRightAnswer)} richtig beantworteten Fragen.\n`;
                    i++;
                });
            }

        }else if(interaction.options.getString("kategorie") === 'mostReactedMessages') {
            let leaderBoardReactionMessage = await conn("SELECT * FROM `reactions` ORDER by amount DESC LIMIT 10;");
            if (leaderBoardReactionMessage.length) {
                let i = 1;
                let discordLink = `https://discord.com/channels/${config.server.serverId}`
                leaderBoardReactionMessage.forEach((element) => {
                    msg += `${rankEmoji[i - 1] ? rankEmoji[i - 1]: "🏅"} Rang ${i}: ${discordLink}/${element["channelId"]}/${element["messageId"]} mit ${inlineCode(element["amount"])} Reaktionen.\n`;
                    i++;
                });
            }

        }

        await interaction.reply({
            content: msg,
            ephemeral: true
        });
    }
}