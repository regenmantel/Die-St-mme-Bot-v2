const {
    inlineCode,
    Client,
    GatewayIntentBits,
    Partials,
    ChannelType,
    PermissionsBitField
} = require("discord.js");
const credentialManager = require("../Credentials/Config");
const config = require("../Credentials/Config");
const {conn} = require("../functions/conn");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent, // Only for bots with message content intent access.
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.login(credentialManager.client.token);

client.on("ready", async () => {
    const rankEmoji = [':first_place:', ':second_place:', ':third_place:'];

    let leaderBoardReactions = await conn("SELECT discordUserId,reactionsReceived FROM `users` ORDER by reactionsReceived DESC LIMIT 3;");
    let leaderBoardMessage = await conn("SELECT discordUserId,messagesSent FROM `users` ORDER by messagesSent DESC LIMIT 3;");
    let leaderBoardQuiz = await conn("SELECT discordUserId,quizRightAnswer FROM `users` ORDER by quizRightAnswer DESC LIMIT 3;");
    let leaderBoardReactionMessage = await conn("SELECT * FROM `reactions` ORDER by amount DESC LIMIT 3;");

    const leaderBoardChannel = client.channels.cache.find(channel => channel.id === config.server.channels.leaderboard);
    await leaderBoardChannel.messages.fetch({limit: 100}).then(messages => {
        messages.forEach(message => message.delete())
    });

    if (leaderBoardReactions.length && leaderBoardMessage.length && leaderBoardQuiz) {
        let i = 1;
        let fieldArray = [];

        leaderBoardReactions.forEach((element) => {
            let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
            let reactions = element["reactionsReceived"];
            fieldArray.push({
                name: `${rankEmoji[i-1]} Rang ` + i,
                value: `${inlineCode(reactionPerson)} mit ${inlineCode(reactions)} Reactions.`,
                inline: true,
            });
            i++;
        });

        for(let space = 1; space <= 2; space++) {
            fieldArray.push({
                name: ` `,
                value: ` `
            });
        }

        i = 1;
        leaderBoardMessage.forEach((element) => {
            let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
            let reactions = element["messagesSent"];
            fieldArray.push({
                name: `${rankEmoji[i-1]} Rang ` + i,
                value: `${inlineCode(reactionPerson)} mit ${inlineCode(reactions)} Nachrichten.`,
                inline: true,
            });
            i++;
        });

        for(let space = 1; space <= 2; space++) {
            fieldArray.push({
                name: ` `,
                value: ` `
            });
        }

        i = 1;
        leaderBoardQuiz.forEach((element) => {
            let reactionPerson = (client.users.cache.get(element["discordUserId"])) ? client.users.cache.get(element["discordUserId"]).username : "Unbekannt"
            let quizRightAnswer = element["quizRightAnswer"];
            fieldArray.push({
                name: `${rankEmoji[i-1]} Rang ` + i,
                value: `${inlineCode(reactionPerson)} mit ${inlineCode(quizRightAnswer)} richtig beantworteten Fragen.`,
                inline: true,
            });
            i++;
        });

        for(let space = 1; space <= 2; space++) {
            fieldArray.push({
                name: ` `,
                value: ` `
            });
        }
        let discordLink = `https://discord.com/channels/${config.server.serverId}`
        i = 1;
        leaderBoardReactionMessage.forEach((element) => {
            fieldArray.push({
                name: `${rankEmoji[i-1]} Rang ` + i,
                value: `${discordLink}/${element["channelId"]}/${element["messageId"]} mit ${inlineCode(element["amount"])} Reaktionen.`,
                inline: true,
            });
            i++;
        });


        const leaderBoardReactionsEmbed = {
            color: 0xED3D7D,
            title: ':chart_with_upwards_trend:  Reactions, Nachrichten, Quiz & Top reagierte Nachrichten  Leaderboards  :chart_with_downwards_trend: ',
            timestamp: new Date(),
            fields: fieldArray,
            footer: {
                text: `Stündlich aktualisiert!`
            }
        }
        await leaderBoardChannel.send({
            embeds: [leaderBoardReactionsEmbed]
        });
    }

    await delay(30000);
    process.exit()
})

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}