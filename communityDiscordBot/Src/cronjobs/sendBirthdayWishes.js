const config = require("../Credentials/Config");
const {conn} = require("../functions/conn");

const sendBirthdayWishes = async function sendBirthdayWishes(client) {
    let birthdayChannel = client.channels.cache.find(channel => channel.id === config.server.channels.birthdayChannelId);
    const birthdays = await conn('SELECT birthday, discordUserId FROM `users` WHERE birthday > 0');

    for (const birthday of birthdays) {

        let user = client.users.cache.get(birthday['discordUserId']);
        if (user) {
            const birthdayWishes = [
                `<@&1159547980551041135> - Wir wünschen ${user} alles Gute zum Geburtstag! 🎂 🥳`,
                `<@&1159547980551041135> - Happy Birthday, ${user}! 🎂 🥳 Wir wünschen dir Gesundheit, Glück und viele unvergessliche Momente in diesem neuen Lebensjahr!`,
                `<@&1159547980551041135> - Zu deinem Ehrentag ${user}, wünschen wir nur das aller Beste! 🎂 🥳`,
                `<@&1159547980551041135> - Das Stämme Team wünscht dir ${user}, alles Gute zu deinem Geburtstag! 🎂 🎈`,
                `<@&1159547980551041135> - Einen fröhlichen Geburtstag, ${user}! 🎂 🥳 Möge dieses Jahr voller Freude und Erfolg für dich sein!`,
                `<@&1159547980551041135> - Ein herzliches Geburtstagsjubiläum, ${user}! 🎂 🥳 Genieße diesen Tag voller Freude, Überraschungen und Liebe von denen, die dich schätzen.`,
                `<@&1159547980551041135> - Alles Gute zum Geburtstag, ${user}! 🎂 🥳`,
                `<@&1159547980551041135> - Happy Birthday, ${user}! 🎂 🎉`,
                `<@&1159547980551041135> - Herzlichen Glückwunsch zum Geburtstag, ${user}! 🎂 🥳`,
                `<@&1159547980551041135> - Herzlichen Geburtststagsgruß, ${user}! 🎂🥳 Ein weiteres Jahr voller Erfolg und Glück`,
                `<@&1159547980551041135> - Alles Liebe zum Geburtstag, ${user}! 🎂 🎈`,
            ]

            let birthdayMember = new Date(birthday["birthday"])
            let dayBirthday = birthdayMember.getDate();
            let monthBirthday = birthdayMember.getMonth();

            let today = new Date();
            let todayDay = today.getDate();
            let todayMonth = today.getMonth();

            if (dayBirthday == todayDay && monthBirthday == todayMonth) {
                await birthdayChannel.send({
                    content: birthdayWishes[Math.floor(Math.random() * 11)]
                });
            }
        }
    }

    return new Promise(resolve => {
        resolve();
    })
}

exports.sendBirthdayWishes = sendBirthdayWishes;
