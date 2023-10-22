const winston = require("winston");

module.exports = {
    name: 'error',
    run: async (error) => {
        let logger = new (winston.createLogger)({
            transports: [
                new (winston.transports.Console)(),
                new (winston.transports.File)({filename: 'StaemmeBotError.log', timestamp: true, /*maxsize: 5242880, maxFiles: 100*/})
            ]
        });

        let dateForException = new Date();
        let dateStr =
            ("00" + (dateForException.getMonth() + 1)).slice(-2) + "/" +
            ("00" + dateForException.getDate()).slice(-2) + "/" +
            dateForException.getFullYear() + " " +
            ("00" + dateForException.getHours()).slice(-2) + ":" +
            ("00" + dateForException.getMinutes()).slice(-2) + ":" +
            ("00" + dateForException.getSeconds()).slice(-2);
        logger.error('discordBotError ' + dateStr + ' :', {message: error});
        process.exit(1);
    },
};