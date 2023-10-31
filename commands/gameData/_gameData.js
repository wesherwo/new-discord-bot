const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
var bot;
var gameData = {};
const path = 'saveData/gameData.json';
const gamesToIgnore = JSON.parse(fs.readFileSync('saveData/gamesToIgnore.json'))["gamesToIgnore"];

/*
TODO: add a way to add to games to ignore through a command and remove them from the list of games
*/

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-game-info')
        .setDescription('Displays the server game time played'),
    async execute(client, interaction) {
        printGameData(interaction);
    },
};

module.exports.startup = (client) => {
    bot = client;
    removeGamesToIgnore();
    setTimeout(runEachMin, 60000);
}

function runEachMin() {
    calcGameData(bot.guilds.cache.at(0).presences.cache);
    setTimeout(runEachMin, 60000);
}

function removeGamesToIgnore() {
    var data = JSON.parse(fs.readFileSync(path));
    gamesToIgnore.forEach(game => {
        if (data.gametime.hasOwnProperty(game)) {
            delete data.gametime[game];
        }
    });
    var jsonData = JSON.stringify(data);
    fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
}

function calcGameData(ppl) {
    ppl.each(user => games = user.activities.forEach(game => {
        if (game.type == 'PLAYING') {
            var name = game.name;
            if (!gamesToIgnore.includes(name)) {
                if (!gameData.hasOwnProperty(name)) {
                    gameData[name] = 1;
                } else {
                    gameData[name]++;
                }
            }
        }
    }));
    var data = JSON.parse(fs.readFileSync(path));
    for (var i in gameData) {
        if (!data.gametime.hasOwnProperty(i)) {
            data.gametime[i] = gameData[i];
        } else {
            data.gametime[i] += gameData[i];
        }
    }
    data.time++;
    var jsonData = JSON.stringify(data);
    fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
    gameData = {};
}

function printGameData(interaction) {
    var data = JSON.parse(fs.readFileSync(path));
    var sorted = [];
    for (var game in data.gametime) {
        sorted.push([game, data.gametime[game]]);
    }
    sorted.sort(function (a, b) { return b[1] - a[1] });
    if (sorted.length == 0) {
        interaction.reply({ content: 'No game data yet', ephemeral: true });
        return;
    }
    var max = sorted[0][1];

    var totalPages = Math.ceil(sorted.length / 20);
    var embeds = [];
    let embed = new EmbedBuilder();
    var fields = 0;
    embed.setColor(3447003).setTitle(`Bot running for ${printTime(data.time)}`);
    for (var i = 0; i < sorted.length; i++) {
        var s = '';
        for (var j = 0; (j < (sorted[i][1] / max) * 40) || (j < 1); j++) {
            s += String.fromCharCode(10074);
        }
        embed.addFields({name: `${sorted[i][0]} - played for ${printTime(sorted[i][1])}`, value: s});
        fields++;
        if ((fields % 20 == 0 || i == sorted.length - 1) && fields > 0) {
            embeds.push(embed);
            embed = new EmbedBuilder();
            embed.setColor(3447003).setTitle(`Bot running for ${printTime(data.time)}`);
            fields = 0;
        }
    }

    let currentPage = 0;

    const prevButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:1081828598433992825>")
        .setStyle(ButtonStyle.Primary);

    var pageNum = new ButtonBuilder()
        .setCustomId("pages")
        .setLabel("Page 1" + "/" + totalPages)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:next:1081828596844339251>")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder()
        .addComponents(prevButton, pageNum, nextButton);

    interaction.reply({
        embeds: [embeds[0]],
        components: [buttons]
    });

    const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000, // 5 minute timeout
    });

    collector.on("collect", (interaction) => {
        if (interaction.customId === "previous") {
            currentPage--;
            if (currentPage < 0) currentPage = 0;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + totalPages);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        } else if (interaction.customId === "next") {
            currentPage++;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + totalPages);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        }
    });

    collector.on("end", (collected) => { interaction.editReply({ components: [] });});
}

function printTime(time) {
    return `${parseInt(time / 60)}hr${time % 60}min`;
}