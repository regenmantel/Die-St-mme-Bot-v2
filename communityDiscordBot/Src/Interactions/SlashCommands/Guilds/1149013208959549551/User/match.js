const {conn} = require('../../../../../functions/conn');
const config = require("../../../../../Credentials/Config");
const {timeConverter} = require("../../../../../functions/timeConverter");
const matchCoolDown = new Set();
const {
    ApplicationCommandType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder, userMention, inlineCode
} = require("discord.js");

let matchAnswers = [];
matchAnswers["lessThan20"] = [
    "Ihr seid definitiv ein Paar mit vielen individuellen Interessen! Eure Übereinstimmung ist wie ein Puzzle mit einigen fehlenden Teilen. Es könnte ein Abenteuer sein, aber nicht jedermanns Sache. Wenn ihr euch ein bisschen wie Bonnie und Clyde fühlen wollt, dann seid ihr hier genau richtig!",
    "Na, ihr seid vielleicht wie Salz und Schokolade - interessante Kombination, aber nicht jedermanns Sache! Eure Übereinstimmung ist so niedrig, dass selbst eure Schatten sich manchmal fremd vorkommen könnten. Aber wer weiß, vielleicht liegt der Spaß in den Unterschieden!",
    "Ihr beiden seid wie ein Kaktus und ein Regenschirm - nicht gerade das beste Match! Eure Übereinstimmung ist so niedrig, dass selbst eure Handabdrücke sich wahrscheinlich nicht verstehen würden. Aber hey, manchmal kann ein wenig Abenteuer ja auch Spaß machen!",
    "Eure Übereinstimmung ist wie eine Pizza ohne Käse - etwas fehlt hier! Es ist offensichtlich, dass ihr viele individuelle Interessen habt. Aber wer weiß, vielleicht könnt ihr euch gegenseitig überraschen und neue Welten erkunden!",
    "Ihr seid wie ein Pinguin und ein Kaktus - interessante Kombination, aber nicht unbedingt ein Match made in heaven! Eure Übereinstimmung ist so niedrig, dass selbst eure Schatten sich manchmal fremd vorkommen könnten. Aber wer weiß, vielleicht liegt der Spaß in den Unterschieden!",
    "Eure Kompatibilität ist wie ein Duett zwischen einer Gitarre und einer Kuhglocke - unerwartet und doch irgendwie faszinierend! Es ist offensichtlich, dass ihr viele individuelle Interessen habt. Aber hey, manchmal kann ein wenig Abenteuer ja auch Spaß machen!",
    "Eure Übereinstimmung ist wie eine Pizza ohne Käse - etwas fehlt hier! Es ist offensichtlich, dass ihr viele individuelle Interessen habt. Aber wer weiß, vielleicht könnt ihr euch gegenseitig überraschen und neue Welten erkunden!",
    "Ihr seid wie ein Hamster und ein Adler - nicht gerade das beste Match! Eure Übereinstimmung ist so niedrig, dass sogar eure Handabdrücke sich wahrscheinlich nicht verstehen würden. Aber hey, in einer Welt voller Tauben seid ihr definitiv die Exoten!",
    "Eure Übereinstimmung ist wie eine Wanderung durch einen Dschungel - voller Überraschungen und Abenteuer! Eure Übereinstimmung ist vielleicht nicht offensichtlich, aber das könnte genau das sein, was diese Beziehung so einzigartig und aufregend macht!"
]
matchAnswers["over20under40"] = [
    "Nun ja, sie sagen ja, dass Gegensätze sich anziehen. Ihr beide könntet ein Lehrbuchbeispiel dafür sein! Eure unterschiedlichen Interessen könnten einen Streit über die Fernbedienung provozieren, aber hey, das hält die Beziehung lebendig, oder?",
    "Ihr seid definitiv ein Paar mit vielen individuellen Interessen! Eure Übereinstimmung ist wie ein Puzzle mit einigen fehlenden Teilen. Es könnte ein Abenteuer sein, aber nicht jedermanns Sache. Wenn ihr euch ein bisschen wie Bonnie und Clyde fühlen wollt, dann seid ihr hier genau richtig!",
    "Eure Kompatibilität ist wie eine Schachtel Pralinen - man weiß nie, was man bekommt! Eure Interessen mögen verschieden sein, aber das könnte auch eine spannende Reise in die Welt des Neuen und Unbekannten bedeuten!",
    "Ihr zwei seid wie eine Wanderung durch einen Dschungel - voller Überraschungen und Abenteuer! Eure Übereinstimmung ist vielleicht nicht offensichtlich, aber das könnte genau das sein, was diese Beziehung so einzigartig und aufregend macht!",
    "Eure Kompatibilität ist wie ein Remix von zwei sehr unterschiedlichen Liedern - manchmal magisch, manchmal chaotisch! Eure Interessen mögen verschieden sein, aber das könnte auch eine spannende Reise in die Welt des Neuen und Unbekannten bedeuten!",
    "Ihr seid definitiv ein Paar mit vielen individuellen Interessen! Eure Übereinstimmung ist wie ein Puzzle mit einigen fehlenden Teilen. Es könnte ein Abenteuer sein, aber nicht jedermanns Sache. Wenn ihr euch ein bisschen wie Bonnie und Clyde fühlen wollt, dann seid ihr hier genau richtig!",
    "Eure Kompatibilität ist wie eine Schachtel Pralinen - man weiß nie, was man bekommt! Eure Interessen mögen verschieden sein, aber das könnte auch eine spannende Reise in die Welt des Neuen und Unbekannten bedeuten!",
    "Eure Übereinstimmung ist wie eine kunterbunte Collage - viele verschiedene Teile, aber sie ergeben zusammen ein Gesamtkunstwerk! Mit so viel Kreativität könnte eure Beziehung wirklich einzigartig sein.",
    "Eure Übereinstimmung ist wie eine Schatzkarte mit einigen verschwommenen Linien - man muss ein wenig suchen, aber der Schatz könnte großartig sein! Es gibt genug Gemeinsamkeiten, um eine interessante Grundlage zu schaffen, aber auch genug Unterschiede, um das Leben aufregend zu gestalten."
]
matchAnswers["over40under60"] = [
    "Es ist offensichtlich, dass Gegensätze sich anziehen! Eure Kompatibilität ist wie ein Tango, mal harmonisch, mal voller temperamentvoller Schritte. Das Leben mit euch beiden ist sicherlich alles andere als langweilig - es ist wie eine tägliche Achterbahnfahrt!",
    "Ihr habt eine Übereinstimmung von 40% bis 59%. Es gibt einige Unterschiede zwischen euch, aber auch Gemeinsamkeiten, die eine Basis für eine Beziehung schaffen können. Es wird wichtig sein, auf eine gesunde Kommunikation und das Finden von Kompromissen zu setzen, um eure Beziehung zu stärken.",
    "Eure Übereinstimmung ist wie eine bunte Mischung aus Gewürzen - manchmal scharf, manchmal süß! Es gibt genug Gemeinsamkeiten, um eine interessante Grundlage zu schaffen, aber auch genug Unterschiede, um das Leben aufregend zu gestalten.",
    "Eure Übereinstimmung ist wie eine bunte Mischung aus Gewürzen - manchmal scharf, manchmal süß! Es gibt genug Gemeinsamkeiten, um eine interessante Grundlage zu schaffen, aber auch genug Unterschiede, um das Leben aufregend zu gestalten.",
    "Ihr seid wie ein Tango - mal harmonisch, mal voller temperamentvoller Schritte. Das Leben mit euch beiden ist sicherlich alles andere als langweilig - es ist wie eine tägliche Achterbahnfahrt!",
    "Eure Kompatibilität ist wie eine Mischung aus Rock und Klassik - unterschiedlich, aber vielleicht auch ein erfrischender Kontrast! Ihr könntet die Welt der unerforschten Abenteuer erkunden.",
    "Eure Übereinstimmung ist wie ein verrücktes Experiment - man weiß nie genau, was als Nächstes passiert, aber es wird sicherlich unterhaltsam! Ihr könntet die Welt der unerforschten Abenteuer erkunden.",
    "Eure Übereinstimmung ist wie ein kunterbuntes Mosaik - viele verschiedene Stücke, die zusammen etwas Wunderschönes ergeben! Es gibt genug Gemeinsamkeiten, um eine interessante Grundlage zu schaffen, aber auch genug Unterschiede, um das Leben aufregend zu gestalten."
]
matchAnswers["over60under80"] = [
    "Nun, das ist doch schon mal was! Eure Übereinstimmung ist wie ein gutes Curry - verschiedene Zutaten, die wunderbar zusammenpassen. Es ist klar, dass ihr euch auf vielen Ebenen versteht, auch wenn ihr ab und zu etwas Chili in die Beziehung werft.",
    "Eure Übereinstimmung ist wie eine witzige Sitcom - voller Überraschungen und Lacher! Ihr habt viele Gemeinsamkeiten, aber auch genug Unterschiede, um das Leben spannend zu halten. Eine Beziehung mit euch beiden könnte eine echte Comedy-Show sein!",
    "Nun, das sieht doch schon vielversprechend aus! Eure Kompatibilität ist so stark, dass selbst eure Handabdrücke auf denselben Wellenlängen liegen. Ihr habt definitiv das Zeug zum Dream-Team!",
    "Eure Übereinstimmung ist wie ein bunter Mixtape - verschiedene Songs, aber sie passen irgendwie perfekt zusammen! Mit so vielen interessanten Facetten könntet ihr eine wahrlich abenteuerliche Reise zusammen antreten.",
    "Eure Übereinstimmung ist wie eine witzige Sitcom - voller Überraschungen und Lacher! Eine Beziehung mit euch beiden könnte eine echte Comedy-Show sein!",
    "Eure Kompatibilität ist wie ein gut abgestimmtes Menü - verschiedene Gänge, aber alle lecker! Ihr könntet die kulinarische Welt erkunden und dabei viele Geschmackserlebnisse entdecken.",
    "Eure Übereinstimmung ist wie eine bunte Mischung aus Gewürzen - manchmal scharf, manchmal süß! Mit so vielen interessanten Facetten könntet ihr eine wahrlich abenteuerliche Reise zusammen antreten.",
    "Eure Übereinstimmung ist wie ein gut eingespieltes Team - ihr ergänzt euch auf wunderbare Weise und könntet gemeinsam Großes erreichen! Es ist klar, dass ihr euch auf vielen Ebenen versteht.",
    "Nun, das sieht doch schon vielversprechend aus! Eure Kompatibilität ist so stark, dass selbst eure Handabdrücke auf denselben Wellenlängen liegen. Ihr habt definitiv das Zeug zum Dream-Team!"
]
matchAnswers["over80under95"] = [
    "Nicht schlecht! Ihr habt eine Kompatibilität, die man nicht alle Tage sieht. Eure Gemeinsamkeiten sind so ausgeprägt, dass man fast denken könnte, ihr seid Klon-Geschwister. Es scheint, als hättet ihr eure eigene geheime Sprache, in der nur ihr beide fließend seid.",
    "Eure Übereinstimmung ist beeindruckend! Es ist, als ob ihr eure eigenen Insider-Witze habt, die nur ihr beide versteht. Mit so viel Harmonie könnte euer gemeinsamer Weg sehr unterhaltsam werden!",
    "Ihr habt eine bemerkenswerte Übereinstimmung von 80% bis 99%. Das ist wirklich beeindruckend! Eure Gemeinsamkeiten sind zahlreich und eure Unterschiede ergänzen sich auf wunderbare Weise. Es ist sehr wahrscheinlich, dass ihr eine glückliche und erfüllte Beziehung führen könnt.",
    "Eure Übereinstimmung ist wie eine gut geölte Maschine - alles läuft reibungslos und effizient! Eure Gemeinsamkeiten sind so ausgeprägt, dass man fast denken könnte, ihr seid Klon-Geschwister.",
    "Eure Übereinstimmung ist wie eine perfekt abgestimmte Melodie - harmonisch und wunderschön! Mit so viel Harmonie könnte euer gemeinsamer Weg sehr unterhaltsam werden!",
    "Eure Übereinstimmung ist wie eine gut eingespielte Band - ihr könntet die Charts stürmen! Es ist klar, dass ihr euch auf vielen Ebenen versteht und gemeinsam großartige Dinge erreichen könnt.",
    "Eure Gemeinsamkeiten sind so stark, dass selbst die Pinguine in der Antarktis neidisch auf euch wären. Ihr habt das Potenzial, das nächste legendäre Power-Duo zu werden!",
    "Ihr habt eine bemerkenswerte Übereinstimmung von 80% bis 95%. Das ist wirklich beeindruckend! Eure Gemeinsamkeiten sind zahlreich und eure Unterschiede ergänzen sich auf wunderbare Weise. Es ist sehr wahrscheinlich, dass ihr eine glückliche und erfüllte Beziehung führen könnt."
]
matchAnswers["over95"] = [
    "Wow, ihr seid offiziell ein Traumpaar! Eure Übereinstimmung ist so hoch, dass selbst Algorithmen neidisch werden. Eure gemeinsamen Interessen sind so stark, dass sie fast miteinander verschmelzen. Wenn das nicht nach einer Liebesgeschichte für die Ewigkeit klingt, dann wissen wir auch nicht weiter!",
    "Herzlichen Glückwunsch! Ihr beiden habt eine beeindruckende Übereinstimmung! Es scheint, als wärt ihr perfekt füreinander geschaffen. Eure Interessen, Werte und Lebensziele harmonieren nahtlos. Dieses Maß an Kompatibilität ist wirklich selten und vielversprechend für eine glückliche Zukunft zusammen.",
    "Haltet euch fest, ihr beiden seid ein 100%-iger Match! Eure Kompatibilität ist so offensichtlich, dass sogar die Pinguine in der Antarktis neidisch auf euch wären. Ihr habt das Potenzial, das nächste legendäre Power-Duo zu werden!",
    "Herzlichen Glückwunsch! Ihr beiden habt eine beeindruckende Übereinstimmung von über 95&! Es scheint, als wärt ihr perfekt füreinander geschaffen. Eure Interessen, Werte und Lebensziele harmonieren nahtlos. Dieses Maß an Kompatibilität ist wirklich selten und vielversprechend für eine glückliche Zukunft zusammen.",
    "Glückwunsch, ihr seid offiziell ein Traumpaar! Eure Übereinstimmung ist so hoch, dass selbst Algorithmen neidisch werden. Eure gemeinsamen Interessen sind so stark, dass sie fast miteinander verschmelzen. Wenn das nicht nach einer Liebesgeschichte für die Ewigkeit klingt, dann wissen wir auch nicht weiter!",
    "Haltet euch fest, ihr beiden seid ein perfektes Match! Eure Kompatibilität ist so offensichtlich, dass sogar die Pinguine in der Antarktis neidisch auf euch wären. Ihr habt das Potenzial, das nächste legendäre Power-Duo zu werden!",
    "Eure Übereinstimmung ist so perfekt, dass wir vermuten, ihr habt euch heimlich synchronisiert! Ihr seid wie ein Match in der Dating-Himmel!",
    "Eure Übereinstimmung ist so stark, dass selbst eure Handabdrücke auf denselben Wellenlängen liegen. Ihr habt definitiv das Zeug zum Dream-Team!"]
module.exports = {
    name: "match",
    description: "Schau wie 2 User zueinander passen.",
    options: [
        {
            name: "user1",
            type: 6,
            description: "User 1",
            required: true
        },
        {
            name: "user2",
            type: 6,
            description: "User 2",
            required: true
        }
    ],
    run: async (client, interaction) => {
        let user1 = await interaction.options.getUser('user1')
        let user2 = await interaction.options.getUser('user2')
        let matchPoints = Math.floor(Math.random() * 101);
        if (user1.id == user2.id) {
            interaction.reply({
                content: `🚫 Du kannst nicht die selbe Person miteinander matchen. 🚫`,
                ephemeral: true
            })
            return;
        } else if (matchCoolDown.has(interaction.user.id)) {
            await interaction.reply({
                content: `"Du kannst nur jede Minute ein Match erstellen.`,
                ephemeral: true
            })
            return;
        } else {
            let message = "";
            if (matchPoints < 20) {
                message = get_random(matchAnswers["lessThan20"]);
            } else if (matchPoints < 40 && matchPoints >= 20) {
                message = get_random(matchAnswers["over20under40"]);
            } else if (matchPoints < 60 && matchPoints >= 40) {
                message = get_random(matchAnswers["over40under60"]);
            } else if (matchPoints < 80 && matchPoints >= 60) {
                message = get_random(matchAnswers["over60under80"]);
            } else if (matchPoints < 95 && matchPoints >= 80) {
                message = get_random(matchAnswers["over80under95"]);
            } else if (matchPoints >= 95) {
                message = get_random(matchAnswers["over95"]);
            }
            interaction.reply({
                content: `${userMention(user1.id)} & ${userMention(user2.id)} passen zu ${matchPoints} % zusammen! \n${inlineCode(message)}`
            })
            matchCoolDown.add(interaction.user.id);
            setTimeout(() => {
                // Removes the user from the set after a minute
                matchCoolDown.delete(interaction.user.id);
            }, 60000 * 1);
        }

    }
}


function get_random(list) {
    return list[Math.floor((Math.random() * list.length))];
}