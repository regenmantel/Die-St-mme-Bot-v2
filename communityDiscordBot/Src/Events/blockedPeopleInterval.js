const {conn} = require("../functions/conn");
const config = require("../Credentials/Config");

const {ActivityType} = require("discord.js");
let imgURL = "https://diestaemmedb.de/discord/banned.png";
module.exports = {
    name: "ready",
    runOnce: true,
    run: async (client) => {
        const guild = client.guilds.cache.get(config.server.serverId);
        let blockedPeople, currentBlockedPeople, currentBlockedPeopleArray = [], blockedPeopleArraySendMessage = [];
        currentBlockedPeople = await conn("SELECT discordUserID FROM `users` WHERE blocked = 1;");
        if (currentBlockedPeople.length) {
            currentBlockedPeople.forEach((people) => {
                currentBlockedPeopleArray.push(people["discordUserID"]);
            })
        }

        setInterval(async () => {
            let blockedPeopleArray = [];
            let currentTime = Math.round(Date.now() / 1000);
            blockedPeople = await conn("SELECT SUM(warningPoints) AS sumWarningPoints, discordUserID FROM `warningPoints` WHERE expiryDate > ? GROUP BY discordUserID;", [currentTime]);
            if (blockedPeople.length) {
                for (const element of blockedPeople) {
                    if (element["sumWarningPoints"] >= 10) {
                        blockedPeopleArray.push(element["discordUserID"]);
                        let blockedMember = await guild.members.cache.get(element["discordUserID"]);
                        if (blockedMember) {
                            await guild.members.cache.get(element["discordUserID"]).roles.add(config.server.activity.blocked);
                            await conn("UPDATE `users` SET blocked = 1 WHERE discordUserID = ?", [element["discordUserID"]]);
                            if (!blockedPeopleArraySendMessage.includes(element["discordUserID"]) && !currentBlockedPeopleArray.includes(element["discordUserID"])) {
                                blockedPeopleArraySendMessage.push(element["discordUserID"])
                                client.users.fetch(element["discordUserID"], false).then((user) => {
                                    try {
                                        user.send({
                                            files: [{
                                                attachment: imgURL
                                            }],
                                            content: 'Du wurdest vorübergehend auf unserem Discord Server gesperrt. Du kannst weiterhin Nachrichten lesen, aber keine mehr senden. Wir hoffen, dass dies nicht noch einmal notwendig ist.',
                                        });
                                    }catch (e) {

                                    }
                                });
                            }
                        }

                    }
                }
            }

            currentBlockedPeople = await conn("SELECT discordUserID FROM `users` WHERE blocked = 1;");
            if (currentBlockedPeople.length) {
                for (const element of currentBlockedPeople) {
                    if (!blockedPeopleArray.includes(element["discordUserID"])) {
                        let blockedMember = await guild.members.cache.get(element["discordUserID"]);
                        if (blockedMember) {
                            await conn("UPDATE `users` SET blocked = 0 WHERE discordUserID = ?", [element["discordUserID"]]);
                            await guild.members.cache.get(element["discordUserID"]).roles.remove(config.server.activity.blocked);
                            if (blockedPeopleArraySendMessage.includes(element["discordUserID"])) {
                                blockedPeopleArraySendMessage = blockedPeopleArraySendMessage.filter(function (item) {
                                    return item !== element["discordUserID"];
                                })
                                currentBlockedPeopleArray = currentBlockedPeopleArray.filter(function (item) {
                                    return item !== element["discordUserID"];
                                })
                                try {
                                    client.users.fetch(element["discordUserID"], false).then((user) => {
                                        user.send('Du wurdest entsperrt. Du kannst nun wieder Nachrichten auf unserem Discord Server senden. Willkommen zurück!');
                                    });
                                }catch (e) {

                                }
                            }
                        }

                    }
                }
            }
        }, 10000)
    }
};
