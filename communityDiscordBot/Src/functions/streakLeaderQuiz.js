const fs = require("fs");
const path = require("path");
const {EmbedBuilder, inlineCode, userMention} = require("discord.js");
const config = require("../Credentials/Config");
let streakLeader = [];
let streakLeaderAnswerArray = ["3","5","8","10"]
streakLeaderAnswerArray["3"] = [
    inlineCode("Gut gemacht, du hast bereits drei korrekte Antworten in einer Runde erreicht – ein beeindruckender Start!"),
    inlineCode("Wow, drei richtige Antworten in einer einzigen Runde – das ist ein vielversprechender Anfang!"),
    inlineCode("Bemerkenswert! In nur einer Runde hast du es bereits auf drei richtige Antworten gebracht."),
    inlineCode("Du fängst stark an! Drei Fragen korrekt beantwortet in einer einzigen Runde – beeindruckend!"),
    inlineCode("Das ist schon mal ein toller Anfang! Drei Richtige!")
]
streakLeaderAnswerArray["5"] = [
    inlineCode("Fantastisch! Das sind 5 korrekte Antworten hintereinander!"),
    inlineCode("Wow! Du hast 5 richtige Antworten erreicht!"),
    inlineCode("Perfekte Runde! 5 richtige Antworten in Folge!"),
    inlineCode("Du bist wirklich gut! Fünf Fragen richtig beantwortet!")
]
streakLeaderAnswerArray["8"] = [
    inlineCode("Unglaublich! Du hast 8 Fragen nacheinander richtig beantwortet!"),
    inlineCode("Bravo! Das sind 8 richtige Antworten in einer Runde!"),
    inlineCode("Du bist wirklich gut! 8 richtige Antworten am Stück!"),
    inlineCode("Das ist beeindruckend! Acht Fragen korrekt beantwortet!")
]
streakLeaderAnswerArray["10"] = [
    inlineCode("Das ist beeindruckend! 10 korrekte Antworten in einer Runde!"),
    inlineCode("Du bist ein Quiz-Champion! 10 richtige Antworten hintereinander!"),
    inlineCode("Du bist ein echter Champ! 10/10, fantastische Leistung!"),
    inlineCode("Das ist außergewöhnlich! Mit 10 richtigen Antworten zeigst du eine erstaunliche Leistung!")
]


module.exports = {
    name: 'streakLeader',
    run: async (interaction, interactionID, userID, channelID, deleteStreak) => {
        if (!deleteStreak) {
            if (!streakLeader[interactionID]) {
                streakLeader[interactionID] = []
                streakLeader[interactionID]["interaction"] = interaction;
                streakLeader[interactionID]["channelID"] = channelID;
                streakLeader[interactionID]["users"] = [];
            }
            if (!streakLeader[interactionID]["users"][userID]) {
                streakLeader[interactionID]["users"][userID] = []
                streakLeader[interactionID]["users"][userID]["amount"] = 1;
                streakLeader[interactionID]["users"][userID]["changed"] = false;
            } else {
                streakLeader[interactionID]["users"][userID]["amount"] += 1;
                switch (streakLeader[interactionID]["users"][userID]["amount"]) {
                    case 3:
                        streakLeader[interactionID]["users"][userID]["changed"] = false;
                        break;
                    case 5:
                        streakLeader[interactionID]["users"][userID]["changed"] = false;
                        break;
                    case 8:
                        streakLeader[interactionID]["users"][userID]["changed"] = false;
                        break;
                    case 10:
                        streakLeader[interactionID]["users"][userID]["changed"] = false;
                        break;
                }
            }
        } else {
            if (streakLeader[interactionID]) {
                delete streakLeader[interactionID];
            }
        }
    }
}

setInterval(async () => {
    for (const [key, value] of Object.entries(streakLeader)) {
        let channelID = value["channelID"];
        let interaction = value["interaction"];
        let users = value["users"];
        for (const [userKey, userValue] of Object.entries(users)) {
            if (!userValue["changed"]) {
                let message;
                switch (userValue["amount"]) {
                    case 3:
                        message = get_random(streakLeaderAnswerArray["3"]);
                        userValue["changed"] = true;
                        break;
                    case 5:
                        message = get_random(streakLeaderAnswerArray["5"]);
                        userValue["changed"] = true;
                        break;
                    case 8:
                        message = get_random(streakLeaderAnswerArray["8"]);
                        userValue["changed"] = true;
                        break;
                    case 10:
                        message = get_random(streakLeaderAnswerArray["10"]);
                        userValue["changed"] = true;
                        break;
                }
                if (message) {
                    let quizChannel = await interaction.guild.channels.cache.get(channelID);
                    await quizChannel.send({
                        content: message + userMention(userKey)
                    });
                }
            }

        }
    }
}, 500)

function get_random (list) {
    return list[Math.floor((Math.random()*list.length))];
}