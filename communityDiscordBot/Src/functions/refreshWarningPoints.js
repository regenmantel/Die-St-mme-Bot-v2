const {conn} = require("./conn");

const refreshWarningPoints = async (userID) => {
    let currentTime = Math.round(Date.now() / 1000);
    let currentWarnings = await conn("SELECT SUM(warningPoints) AS TotalItemsOrdered FROM `warningPoints` WHERE discordUserID = ? and expiryDate > ?;", [userID, currentTime]);
    currentWarnings = currentWarnings[0]["TotalItemsOrdered"];
    if(currentWarnings === null){
        currentWarnings = 0;
    }
    await conn("UPDATE `users` SET warningPoints = ? WHERE discordUserID = ?;", [currentWarnings ,userID]);
};

module.exports = {
    refreshWarningPoints
};