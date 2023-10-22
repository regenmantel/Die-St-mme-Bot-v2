module.exports = {
    name: "example",
    allowInDms: true,
    aliases: ["pong"],
    run: async(client, message, args) => {
        message.channel.send(`My ping is ${client.ws.ping}ms.`);
    }
};