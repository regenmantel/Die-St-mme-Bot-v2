const winston = require("winston");
module.exports = {
    name: "errorManager",
    customEvent: true,
    run: async() => {
        let logger = new (winston.createLogger)({
            transports: [
                new (winston.transports.Console)(),
                new (winston.transports.File)({filename: 'StaemmeBotError.log', timestamp: true, /*maxsize: 5242880, maxFiles: 100*/})
            ]
        });
        process.on('unhandledRejection', error => {
            console.log(error)
            let dateForException = new Date();
            let dateStr =
                ("00" + (dateForException.getMonth() + 1)).slice(-2) + "/" +
                ("00" + dateForException.getDate()).slice(-2) + "/" +
                dateForException.getFullYear() + " " +
                ("00" + dateForException.getHours()).slice(-2) + ":" +
                ("00" + dateForException.getMinutes()).slice(-2) + ":" +
                ("00" + dateForException.getSeconds()).slice(-2);
            logger.error('uncaughtException ' + dateStr + ' :', {message: error.message, stack: error.stack});
        });
        process.on('uncaughtException', error => {
            console.log(error)
            let dateForException = new Date();
            let dateStr =
                ("00" + (dateForException.getMonth() + 1)).slice(-2) + "/" +
                ("00" + dateForException.getDate()).slice(-2) + "/" +
                dateForException.getFullYear() + " " +
                ("00" + dateForException.getHours()).slice(-2) + ":" +
                ("00" + dateForException.getMinutes()).slice(-2) + ":" +
                ("00" + dateForException.getSeconds()).slice(-2);
            logger.error('uncaughtException ' + dateStr + ' :', {message: error.message, stack: error.stack});
        });
        process.on('uncaughtExceptionMonitor', error => {
            console.log(error)
            let dateForException = new Date();
            let dateStr =
                ("00" + (dateForException.getMonth() + 1)).slice(-2) + "/" +
                ("00" + dateForException.getDate()).slice(-2) + "/" +
                dateForException.getFullYear() + " " +
                ("00" + dateForException.getHours()).slice(-2) + ":" +
                ("00" + dateForException.getMinutes()).slice(-2) + ":" +
                ("00" + dateForException.getSeconds()).slice(-2);
            logger.error('uncaughtException ' + dateStr + ' :', {message: error.message, stack: error.stack});
        });
    }
};