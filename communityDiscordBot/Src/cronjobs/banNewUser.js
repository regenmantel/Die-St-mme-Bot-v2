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
    const guild = client.guilds.resolve(config.server.serverId);

// Fetch the members of the guild and log them
    guild.members.fetch()
        .then(async members => {
            members.forEach((member) => {
                if (!member.user.bot) {
                    let timestamp = new Date(Date.now() - 604800000);
                    if (timestamp < member.user.createdAt) {
                        guild.members.ban(member.user.id);
                    }
                }
            })
        })

    await delay(30000);
    process.exit()
})

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}