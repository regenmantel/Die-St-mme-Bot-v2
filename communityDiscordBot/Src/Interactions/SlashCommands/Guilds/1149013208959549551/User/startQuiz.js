const {conn} = require('../../../../../functions/conn');
const quizDelay = require("../../../../../functions/quizDelay");

const {
    inlineCode,
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle, ChannelType, PermissionsBitField
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../../../../Credentials/Config");

module.exports = {
    name: "startquiz",
    description: "Starte ein Quiz",
    run: async (client, interaction) => {

        let questionArray = [];
        let questionTxt = fs.readFileSync(path.resolve(__dirname, '../../../../../assets/list/Questions.txt'), 'utf8').toString().replaceAll("\r", "");
        let regEx = /(?<question>.+),(\s+|)(?<answer>.+)/gm;
        let match;
        while ((match = regEx.exec(questionTxt)) !== null) {
            let testArray = [match.groups["question"], match.groups["answer"]]
            questionArray.push(testArray)
        }
        let questionID = Math.floor(Math.random() * (questionArray.length));

        const quizEmbed = new EmbedBuilder()
            .setTitle(inlineCode(questionArray[questionID][0]))
            .setAuthor({
                name: 'Quizmaster',
                iconURL: `${interaction.guild.iconURL()}`
            })
            .setTimestamp()
            .setColor(0xED3D7D)
        const quizComponents = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('answerQuiz')
                .setLabel('Antworten')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎮')
        )
        await interaction.reply({
            embeds: [quizEmbed],
            components: [quizComponents]
        })
    }
}