const {conn} = require("../functions/conn");
const config = require("../Credentials/Config");
const {EmbedBuilder, inlineCode, userMention, time, channelMention} = require("discord.js");

module.exports = {
    name: 'messageDelete',
    run: async (message, client) => {
        if(!message) return;
        const deleteMessageChannel = client.channels.cache.find(channel => channel.id === config.server.channels.deleteMessageChannelID);
        if (message.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                message = await message.fetch();
            } catch (error) {
                return;
            }
        }
        if (!message.author.bot) {
            await conn('UPDATE users SET sendMessages = sendMessages - 1 WHERE discordUserId = ?', [message.author.id]);
            await conn("DELETE FROM `reactions` WHERE channelId = ? and messageId = ?",[message.channelId,message.id])
            let offTopic = await client.channels.cache.get(message.channelId);
            let currentTime = Math.round(Date.now() / 1000);
            await conn('INSERT INTO `messageArchiv` (channelName,messageAuthor,discordUserID,messageContent,timestamp) VALUES (?,?,?,?,?)', [offTopic.name, message.author.globalName, message.author.id, message.content, currentTime]);

            if(message.content == ""){
                message.content = message.attachments.first().url;
            }

            await deleteMessageChannel.send({
                content: `Author: ${userMention(message.author.id)} | Channel: ${channelMention(message.channelId)} | Nachricht: ${inlineCode(message.content)} | Zeit: ${time(currentTime)}`
            })
        }

    },
};
