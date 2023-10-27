const {createLeaderboard} = require("../cronjobs/leaderboard");
const {catchForumInformations} = require("../cronjobs/catchForumInformations");
const {sendBirthdayWishes} = require("../cronjobs/sendBirthdayWishes");
const {createWorlds} = require("../cronjobs/createNewWorlds");
module.exports = {
    name: "ready",
    runOnce: true,
    run: async (client) => {

        setInterval(() => {
            checkTime(client)
        }, 1000)

        async function checkTime(client) {
            let hour = new Date().getHours();
            let minute = new Date().getMinutes();
            let seconds = new Date().getSeconds();

            if (hour == "08" && minute == "00" && seconds == "00") {
                await createLeaderboard(client)
                await catchForumInformations(client)
                await createWorlds(client)
                await sendBirthdayWishes(client)
            } else if (minute == "00" && seconds == "00") {
                await createLeaderboard(client)
                await catchForumInformations(client)
                await createWorlds(client)
            }
        }
    }
};
