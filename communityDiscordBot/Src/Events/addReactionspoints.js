const {conn} = require("../functions/conn");

module.exports = {
    name: 'messageReactionAdd',
    run: async (reaction, user) => {
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                reaction = await reaction.fetch();
            } catch (error) {
                return;
            }
        }
        if (reaction.message.author.id === user.id || reaction.message.author.bot) {
            return;
        }

        let reactionExist = await conn("SELECT * FROM `reactions` WHERE messageId = ? AND channelId = ?",[reaction.message.id,reaction.message.channelId])
        if(reactionExist.length){
            await conn("UPDATE `reactions` SET amount = amount+1 WHERE messageId = ? AND channelId = ?",[reaction.message.id,reaction.message.channelId])
        }else{
            await conn("INSERT INTO `reactions` VALUES (?,?,?)",[reaction.message.id,reaction.message.channelId,1])
        }

        await conn('UPDATE users SET reactionsSent = reactionsSent + 1 WHERE discordUserId = ?', [user.id]);
        await conn('UPDATE users SET reactionsReceived = reactionsReceived + 1 WHERE discordUserId = ?', [reaction.message.author.id]);

    },
};