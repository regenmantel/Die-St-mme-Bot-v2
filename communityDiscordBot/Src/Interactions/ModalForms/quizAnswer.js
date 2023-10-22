const {conn} = require('../../functions/conn');
const {
    inlineCode,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const fs = require("fs");
const path = require("path");
const {time} = require("discord.js")
const streakLeader = require("../../functions/streakLeaderQuiz");
const quizDelay = require("../../functions/quizDelay");

module.exports = {
    name: "answerQuiz",
    run: async (client, interaction) => {

        if (interaction.message === null) {
            interaction.reply({
                content: "Das Spiel ist vorbei :("
            })
            return;
        }
        if (interaction.message.embeds.length > 0) {
            let question = interaction.message.embeds[0].data.title.replaceAll("`", "");
            let questionAnswer = interaction.fields.getTextInputValue('answer');
            let questionArray = [];
            let questionTxt = fs.readFileSync(path.resolve(__dirname, '../../assets/list/Questions.txt'), 'utf8').toString().replaceAll("\r", "");
            let regEx = /(?<question>.+),(\s+|)(?<answer>.+)/gm;
            let match;
            let correctAnswer = false;

            while ((match = regEx.exec(questionTxt)) !== null) {
                if (question == match.groups["question"]) {
                    let answerArray = match.groups["answer"].split("|");
                    answerArray.forEach((element) => {
                        if (questionAnswer.toLowerCase() == element.trim().toLowerCase()) {
                            correctAnswer = true;
                        }
                    })
                }
                let testArray = [match.groups["question"], match.groups["answer"]]
                questionArray.push(testArray)
            }
            let questionID = Math.floor(Math.random() * (questionArray.length));

            if (correctAnswer) {
                await quizDelay.run(interaction.message.id, interaction.message, true)
                await streakLeader.run(interaction, interaction.message.id, interaction.user.id, interaction.message.channelId);
                interaction.message.edit({
                        content: "",
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(inlineCode(questionArray[questionID][0]))
                                .setAuthor({
                                    name: 'Quizmaster',
                                    iconURL: `${interaction.guild.iconURL()}`
                                })
                                .setTimestamp()
                                .setColor(0xED3D7D)
                        ],
                    }
                )
                interaction.reply({
                    content: inlineCode("Sehr gut! Das war komplett richtig!"),
                    ephemeral: true
                })
                await conn("UPDATE `users` SET quizRightAnswer = quizRightAnswer +1 WHERE discordUserId = ?", [interaction.user.id])
            } else {
                interaction.reply({
                    content: inlineCode("Das war leider falsch. Probiere es doch gleich nochmal!"),
                    ephemeral: true
                })
                await streakLeader.run(interaction, interaction.message.id, interaction.user.id, interaction.message.channelId, true);
            }
        } else {
            interaction.reply({
                content: "Das Spiel ist vorbei :(",
                ephemeral: true
            })
        }
    }
};