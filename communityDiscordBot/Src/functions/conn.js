const config = require("../Credentials/Config");
const mysql = require('mysql2');

const conn = (query, args) => {
    return new Promise(resolve => {
        let conn = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database,
            port: config.mysql.port
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
    conn
};