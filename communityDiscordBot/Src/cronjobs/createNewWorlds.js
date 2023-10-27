const {
    ChannelType,
    PermissionsBitField
} = require("discord.js");
const https = require("https");
const config = require("../Credentials/Config");
const {dbBotConn} = require("../functions/DBBotConn");

const createWorlds = async function createWorlds(client) {
    const url = config.innoGames.urls.getServerUrl;
    const guild = client.guilds.cache.get(config.server.serverId);

    const ppWorlds = config.server.categorys.ppWorldsId;
    const nonPpWorlds = config.server.categorys.nonPpWorldsId;
    const specialWorlds = config.server.categorys.specialWorldsId;
    const worldsArchive = config.server.categorys.worldArchiveId;

    https.get(url, async (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', async () => {
            const regex = /(de\d+|dep\d+|dec\d+)/g;
            let found = data.match(regex);
            let botFound = [...found].map(i => i + '_bot');
            found = new Set(found);
            let readWorlds = [...found]
            for (const loopWorlds of readWorlds) {
                const existingRole = guild.roles.cache.find(role => role.name === loopWorlds);

                if (existingRole) {
                    // log(`Rolle ${existingRole.name} existiert bereits.`, 'info');
                } else {
                    const newRole = await guild.roles.create({
                        name: loopWorlds
                    });

                    // log(`Rolle ${newRole.name} wurde erstellt.`, 'done');
                }
                const existingChannel = guild.channels.cache.find(channel => channel.name === loopWorlds && channel.type === ChannelType.GuildText);


                /*
                if (existingChannel) {
                    await existingChannel.delete();
                }
                const existingChannelBot = guild.channels.cache.find(channel => channel.name === loopWorlds + "_bot" && channel.type === ChannelType.GuildText);
                if (existingChannelBot) {
                    await existingChannelBot.delete();
                }
                continue;
                */

                if (existingChannel) {
                    //log(`Kanal ${existingChannel.name} existiert bereits.`, 'info');
                } else {
                    const newChannel = await guild.channels.create({
                        name: loopWorlds,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: existingRole.id,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            }
                        ],
                    });
                    const newChannelBot = await guild.channels.create({
                        name: loopWorlds + "_bot",
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: existingRole.id,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            }
                        ],
                    });
                    let getBotChannel = guild.channels.cache.find(channel => channel.name === loopWorlds + "_bot" && channel.type === ChannelType.GuildText);
                    await dbBotConn("REPLACE INTO `DiscordChannels` VALUES (?,?,?,?,?,?)", [getBotChannel.id, loopWorlds, -2, "Die Stämme DE", config.server.serverId, getBotChannel.name]);
                    // log(`Kanal ${newChannel.name} wurde erstellt.`, 'done');

                    const categoryPPWorlds = guild.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === ppWorlds);
                    const categoryNonPPWorlds = guild.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === nonPpWorlds);
                    const categorySpecialWorlds = guild.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === specialWorlds);

                    if (categoryPPWorlds && categorySpecialWorlds && categoryNonPPWorlds) {
                        if (newChannel.name.startsWith('dep') || newChannel.name.startsWith('dec')) {
                            await newChannel.setParent(categorySpecialWorlds);
                            await newChannelBot.setParent(categorySpecialWorlds);
                        } else {
                            let worldType = newChannel.name.slice(2) / 2;
                            if (Number.isInteger(worldType)) {
                                await newChannel.setParent(nonPpWorlds);
                                await newChannelBot.setParent(nonPpWorlds);
                            } else {
                                await newChannel.setParent(ppWorlds);
                                await newChannelBot.setParent(ppWorlds);
                            }
                        }
                    }
                }
            }

            const targetCategory = guild.channels.cache.find(category => category.type === ChannelType.GuildCategory && category.id === worldsArchive);
            const channelsInCategory = guild.channels.cache.filter((category) => category.type === ChannelType.GuildText && category.parentId === specialWorlds || category.parentId === ppWorlds || category.parentId === nonPpWorlds);

            channelsInCategory.forEach((channel) => {
                if (![...found].includes(channel.name) && channel.name !== "sds" && !botFound.includes(channel.name)) {
                    channel.setParent(targetCategory);
                    //  log(`Kanal ${channel.name} wurde ins archiv verschoben.`, 'done');
                } else {
                    // log(`Es wurde kein Kanal ins archiv verschoben, alle Kanäle sind aktuell`, 'info');
                }
            });
        });
    });

    return new Promise(resolve => {
        resolve();
    })
}

exports.createWorlds = createWorlds;