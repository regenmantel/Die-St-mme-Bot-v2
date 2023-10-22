(async () => {
    const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
    const credentialManager = require("./communityDiscordBot/Src/Credentials/Config");
    const dirPath = __dirname;
    const { messageCommandsManager, eventsManager, buttonManager, selectMenuManager, modalFormsManager, slashCommandsManager } = require("./communityDiscordBot/Src/Structures/Managers/Export");
    const botClient = new Client({
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

    exports.rootPath = dirPath;
    exports.client = botClient;
    botClient.messageCommands = new Collection();
    botClient.messageCommandsAliases = new Collection();
    botClient.events = new Collection();
    botClient.buttonCommands = new Collection();
    botClient.selectMenus = new Collection();
    botClient.modalForms = new Collection();
    botClient.slashCommands = new Collection();

    await messageCommandsManager(botClient, dirPath);
    await eventsManager(botClient, dirPath);
    await buttonManager(botClient, dirPath);
    await selectMenuManager(botClient, dirPath);
    await modalFormsManager(botClient, dirPath);
    await botClient.login(credentialManager.client.token);
    await slashCommandsManager(botClient, dirPath);

    let winston = require('winston');
    let logger = new (winston.createLogger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({filename: 'StaemmeBotError.log', timestamp: true, /*maxsize: 5242880, maxFiles: 100*/})
        ]
    });
    botClient.on('error', err => {
        let dateForException = new Date();
        let dateStr =
            ("00" + (dateForException.getMonth() + 1)).slice(-2) + "/" +
            ("00" + dateForException.getDate()).slice(-2) + "/" +
            dateForException.getFullYear() + " " +
            ("00" + dateForException.getHours()).slice(-2) + ":" +
            ("00" + dateForException.getMinutes()).slice(-2) + ":" +
            ("00" + dateForException.getSeconds()).slice(-2);
        logger.error('botClientOnError ' + dateStr + ' :', {message: err});
        process.exit(1);
    });


})();