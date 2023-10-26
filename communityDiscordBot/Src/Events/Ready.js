const { bold } = require("chalk");
const { rootPath } = require("../../../communityBot");
const { statSync } = require("node:fs");
const directorySearch = require("node-recursive-directory");
const config = require('../Credentials/Config');
const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    runOnce: true,
    run: async (client) => {

        const guild = client.guilds.cache.get(config.server.serverId);
        let channelArray = []
        guild.channels.cache.forEach((channel) => {
            if(channel.type == 0 || channel.type == 1){
                channelArray.push(channel.id)
            }
        });

        for (const channel of channelArray) {
            const currentChannel = await client.channels.cache.get(channel);
            currentChannel.messages.fetch().then(async messages => {
                for (const message of messages) {
                    await currentChannel.messages.fetch(message.id);
                }
            })
        }

        client.user.setPresence({
            activities: [{ name: `Die Stämme DE`, type: ActivityType.Playing }],
            status: 'dnd',
        });

        let allSlashCommands = 0;
        const slashCommandsTotalFiles = await directorySearch(`${rootPath}/Src/Interactions/SlashCommands`);
        await slashCommandsTotalFiles.forEach(cmdFile => {
            if (statSync(cmdFile).isDirectory()) return;
            const slashCmd = require(cmdFile);
            if (!slashCmd.name || slashCmd.ignore || !slashCmd.run) return;
            else allSlashCommands++
        });

        console.log(bold.green("[Client] ") + bold.blue(`Logged into ${client.user.tag}`));
        if (client.messageCommands.size > 0) console.log(bold.red("[MessageCommands] ") + bold.cyanBright(`Loaded ${client.messageCommands.size} MessageCommands with ${bold.white(`${client.messageCommandsAliases.size} Aliases`)}.`));
        if (client.events.size > 0) console.log(bold.yellowBright("[Events] ") + bold.magenta(`Loaded ${client.events.size} Events.`));
        if (client.buttonCommands.size > 0) console.log(bold.whiteBright("[ButtonCommands] ") + bold.greenBright(`Loaded ${client.buttonCommands.size} Buttons.`));
        if (client.selectMenus.size > 0) console.log(bold.red("[SelectMenus] ") + bold.blueBright(`Loaded ${client.selectMenus.size} SelectMenus.`));
        if (client.modalForms.size > 0) console.log(bold.cyanBright("[ModalForms] ") + bold.yellowBright(`Loaded ${client.modalForms.size} Modals.`));
        if (allSlashCommands > 0) console.log(bold.magenta("[SlashCommands] ") + bold.white(`Loaded ${allSlashCommands} SlashCommands.`));
    }
};