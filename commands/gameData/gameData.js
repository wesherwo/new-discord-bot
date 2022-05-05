const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
var bot;
var gameData = {};
const path = 'saveData/gameData.json';

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
    setTimeout(runEachMin, 60000);
}

function runEachMin() {
    calcGameData(bot.guilds.cache.at(0).presences.cache);
    setTimeout(runEachMin, 60000);
}

function calcGameData(ppl) {
    ppl.each(user => games = user.activities.forEach(game => {
        if (game.type == 'PLAYING') {
            var name = game.name;
            if (!gameData.hasOwnProperty(name)) {
                gameData[name] = 1;
            } else {
                gameData[name]++;
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

    var s = '';
    let embed = new MessageEmbed();
    embed.setColor(3447003).setTitle(`Bot running for ${printTime(data.time)}`);
    var page = 1;
    for (var i = 0; i < sorted.length; i++) {
        s = '';
        for (var j = 0; (j < (sorted[i][1] / max) * 40) || (j < 1); j++) {
            s += String.fromCharCode(10074);
        }
        embed.addField(`${sorted[i][0]} - played for ${printTime(sorted[i][1])}`, s);
        if ((embed.fields.length % 20 == 0 || i == sorted.length - 1) && embed.fields.length > 0) {
            interaction.reply({ embeds: [embed] });
            page++;
            embed = new MessageEmbed();
            embed.setColor(3447003).setTitle(`page ${page}`);
        }
    }
}

function printTime(time) {
    return `${parseInt(time / 60)}hr${time % 60}min`;
}