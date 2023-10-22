const fs = require("fs");
const path = require("path");
const {EmbedBuilder, inlineCode} = require("discord.js");
const streakLeader = require("./streakLeaderQuiz");
let interactionObject = [];
module.exports = {
    name: 'quizDelay',
    run: async (interactionID, message, rightAnswer) => {

        let timestamp = Math.round(Date.now() / 1000);

        if (!interactionObject[interactionID]) {
            interactionObject[interactionID] = []
            interactionObject[interactionID]["timestamp"] = timestamp;
            interactionObject[interactionID]["function"] = message;
            interactionObject[interactionID]["changedFirstTry"] = false;
            interactionObject[interactionID]["changedSecondTry"] = false;
            interactionObject[interactionID]["changedThirdTry"] = false;
        } else if (rightAnswer) {
            interactionObject[interactionID]["timestamp"] = timestamp;
            interactionObject[interactionID]["changedFirstTry"] = false;
            interactionObject[interactionID]["changedSecondTry"] = false;
            interactionObject[interactionID]["changedThirdTry"] = false;
        }
    }
}

setInterval(async () => {
    let timestampFirstTry = Math.round(Date.now() / 1000) - 30;
    let timestampSecondTry = timestampFirstTry - 30;
    let timestampThirdTry = timestampSecondTry - 30;
    let timestampDelete = timestampThirdTry - 30;

    for (const [key, value] of Object.entries(interactionObject)) {
        if ((value["timestamp"] < timestampFirstTry && !value["changedFirstTry"]) || (value["timestamp"] < timestampSecondTry && !value["changedSecondTry"]) || (value["timestamp"] < timestampThirdTry && !value["changedThirdTry"])) {

            let questionArray = [];
            let questionTxt = fs.readFileSync(path.resolve(__dirname, '../assets/list/Questions.txt'), 'utf8').toString().replaceAll("\r", "");
            let regEx = /(?<question>.+),(\s+|)(?<answer>.+)/gm;
            let match;

            while ((match = regEx.exec(questionTxt)) !== null) {
                let testArray = [match.groups["question"], match.groups["answer"]]
                questionArray.push(testArray)
            }

            let questionID = Math.floor(Math.random() * (questionArray.length));

            if (value["timestamp"] < timestampFirstTry && !value["changedFirstTry"]) {
                value["changedFirstTry"] = true;
            } else if (value["timestamp"] < timestampSecondTry && !value["changedSecondTry"]) {
                value["changedSecondTry"] = true;
            } else if (value["timestamp"] < timestampThirdTry && !value["changedThirdTry"]) {
                value["changedThirdTry"] = true;
            }

            value["function"].edit({
                content: "Frage geändert.",
                embeds: [
                    new EmbedBuilder()
                        .setTitle(inlineCode(questionArray[questionID][0]))
                        .setAuthor({
                            name: 'Quizmaster',
                            iconURL: `${value["function"].guild.iconURL()}`
                        })
                        .setTimestamp()
                        .setColor(0xED3D7D)
                ],
            })
        }
        if (value["timestamp"] < timestampDelete) {
            await streakLeader.run(0, value["function"].id, 0, 0, true);
            value["function"].edit({
                content: "🎮 "+inlineCode("Quiz ist vorbei.")+" 🎮",
                embeds: [],
                components: []
            })
            delete interactionObject[key]
        }
    }
}, 1000)