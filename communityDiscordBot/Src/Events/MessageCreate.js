const credentialManager = require("../Credentials/Config");
const commandOptionsProcessor = require("../Structures/CommandOptions/Processor");
const insultFilter = require("../functions/insultFilter");
const activityPoints = require("../functions/activityPoints");
const {conn} = require("../functions/conn");

module.exports = {
    name: "messageCreate",
    run: async (message, client) => {
        await insultFilter.run(client, message);
        await activityPoints.run(client, message);
        if(!message.author.bot){
            await conn('UPDATE users SET messagesSent = messagesSent + 1 WHERE discordUserId = ?', [message.author.id]);
        }

        if (!Array.isArray(credentialManager.client.prefix)) return;
        for (const botPrefix of credentialManager.client.prefix) {
            if (!message.content.startsWith(botPrefix)) continue;
            const commandName = message.content.toLowerCase().slice(botPrefix.length).trim().split(" ")[0];
            const command = client.messageCommands.get(commandName) ?? client.messageCommands.get(client.messageCommandsAliases.get(commandName));
            if (!command) continue;
            const args = message.content.slice(botPrefix.length).trim().slice(commandName.length).trim().split(" ");
            const authenticatedCMDOptions = await commandOptionsProcessor(client, message, command, false, "MessageCommand");

            if (command.allowInDms) {
                if (authenticatedCMDOptions) await command.run(client, message, args);
            } else if (!message.guild) continue;
            else if (command.allowBots) {
                if (authenticatedCMDOptions) await command.run(client, message, args);
            } else if (message.author.bot) continue;
            else if (authenticatedCMDOptions) await command.run(client, message, args);
        }
    }
};
