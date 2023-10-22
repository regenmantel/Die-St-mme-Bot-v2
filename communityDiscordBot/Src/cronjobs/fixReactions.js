const {
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
    const guild = client.guilds.cache.get(config.server.serverId);
    const ticketChannel = guild.channels.cache.get(config.server.channels.ticketChannelId);
    const ticketArchiev = config.server.categorys.ticketArchiv;

    let channelCount = 0;
    let lastChannel;

    guild.channels.cache.forEach((channell) => {
        if (channell.parentId === ticketArchiev) {
            channelCount++;
            if(!lastChannel){
                lastChannel = channell;
            }else{
                if (channell.createdTimestamp < lastChannel.createdTimestamp) {
                    lastChannel = channell;
                }
            }
        }
    });

    await delay(300);

    if (channelCount >= 50 && lastChannel.id) {
        let messagesFromChannel = [];
        let getLastChannel = client.channels.cache.get(lastChannel.id);
        getLastChannel.messages.fetch({limit: 100}).then(async messages => {
            messages.forEach((message) => {
                if (message.author.globalName) {
                    messagesFromChannel.push(
                        {
                            author: message.author.globalName,
                            authorID: message.author.id,
                            content: message.content
                        }
                    )
                }
            })
            console.log(lastChannel.name)
            let timestamp = Math.round(Date.now() / 1000);
            let jsonMessages = JSON.stringify(messagesFromChannel);
            //await conn("INSERT INTO `ticketArchiv` (ticketName,ticketMessages,timestamp) VALUES (?,?,?)", [lastChannel.name, jsonMessages, timestamp])
            //lastChannel.delete()
        })
    }
    await delay(30000);
    process.exit()
})

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}