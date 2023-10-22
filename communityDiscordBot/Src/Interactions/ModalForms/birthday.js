const {conn} = require('../../functions/conn');

const { inlineCode } = require('discord.js');

module.exports = {
    name: "birthday",
    run: async(client, interaction) => {
        const day = parseInt(interaction.fields.getTextInputValue('day'));
        const month = parseInt(interaction.fields.getTextInputValue('month'));
        const year = parseInt(interaction.fields.getTextInputValue('year'));

        if(!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)){
            await interaction.reply({
                content: `Bitte trage Zahlen ein.`,
                ephemeral: true
            });
            return;
        }
        if(day < 1 || day > 31){
            await interaction.reply({
                content: `Bitte einen gültigen Tag eingeben.`,
                ephemeral: true
            });
            return;
        }
        if(month < 1 || month > 12){
            await interaction.reply({
                content: `Bitte einen gültigen Monat eingeben.`,
                ephemeral: true
            });
            return;
        }
        if(year < 1950 || year > 2030){
            await interaction.reply({
                content: `Bitte ein gültiges Jahr eingeben.`,
                ephemeral: true
            });
            return;
        }

        //keine Ahnung warum der beim Datum jedes mal ne Stunde abzieht, deswegen dirty fix
        let date = new Date([`${year}-${month}-${day}`])/1000;
        date = (date+60*60)*1000;

        await conn("UPDATE `users` SET birthday = ? WHERE discordUserID = ?", [date, interaction.user.id]);

        await interaction.reply({
            content: `Dein Geburtstag ${inlineCode(day)}.${inlineCode(month)}.${inlineCode(year)} wurde in deinem Profil eingetragen.`,
            ephemeral: true
        });
    }
};