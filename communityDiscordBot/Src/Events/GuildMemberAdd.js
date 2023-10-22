const {conn} = require("../functions/conn");
const config = require("../Credentials/Config");

module.exports = {
    name: 'guildMemberAdd',
    run: async (member, client) => {
        const guild = client.guilds.cache.get(config.server.serverId);

        if (!member.user.bot) {
            let timestamp = new Date(Date.now() - 604800000);
            if (timestamp < member.user.createdAt) {
                await guild.members.ban(member.user.id);
            }
        }
        try {
            await guild.members.cache.get(member.user.id).roles.add(config.server.activity.spaeher);
        } catch (e) {

        }
        await conn('INSERT INTO `users` (discordName,discordUserId,level) VALUES (?,?,?)', [member.user.username, member.user.id, 'Späher (Level 0)']);
    },
};