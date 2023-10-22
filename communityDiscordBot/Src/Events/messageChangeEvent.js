const {conn} = require("../functions/conn");
const insultFilter = require("../functions/insultFilter");

module.exports = {
    name: 'messageUpdate',
    run: async (oldMessage, newMessage,client) => {
        await insultFilter.run(client, newMessage);

        if (oldMessage.partial) {
            try {
                oldMessage = await oldMessage.fetch();
            } catch (error) {
                return;
            }
        }else{
            oldMessage = await oldMessage.fetch();
        }

        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            } catch (error) {
                return;
            }
        }
        let currentTime = Math.round(Date.now() / 1000);

        if (!oldMessage.author.bot) {
            await conn('INSERT INTO `changeMessageArchiv` (channelID,messageID,discordUserID,oldMessage,newMessage,timeunix) VALUES (?,?,?,?,?,?)',
                [newMessage.channel.id, newMessage.id, newMessage.author.id, oldMessage.content, newMessage.content, currentTime]);
        }
    },
};