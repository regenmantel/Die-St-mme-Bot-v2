const config = require("../Credentials/Config");
const mysql = require('mysql2');

const dbBotConn = (query, args) => {
    return new Promise(resolve => {
        let conn = mysql.createConnection({
            host: config.DBBotMysql.host,
            user: config.DBBotMysql.user,
            password: config.DBBotMysql.password,
            database: config.DBBotMysql.database,
            port: config.DBBotMysql.port
        });
        conn.execute(
            query,
            args,
            async function (err, results, fields) {
                resolve(results)
                await conn.end();
                await conn.destroy();
            });
    });
};

module.exports = {
    dbBotConn
};