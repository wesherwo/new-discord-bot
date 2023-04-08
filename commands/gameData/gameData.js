const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
        .setDescription('Displays the server game time played')
        .addIntegerOption(option => option.setName('pages').setDescription('Number of pages to display')),
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
            // Check for who the fuck is playing a stupid ass game
            if(name == '3DMark Demo' || name == 'Prose & Codes' || name == 'with ur mom' || name == 'Unreal Engine 5.1' || name == 'Cinema 4D'
            || name == 'XSOverlay' || name == 'GDLauncher' || name == 'EVGA Precision X1' || name == 'DZSALauncher' || name == 'SteamVR Media Player'
            || name == 'Unreal Engine' || name == 'Yu Crossing Animals') {
                console.log(user.user.username + ' Playing ' + name);
            }
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

    var pages = interaction.options.getInteger('pages') * 20;
    if(!pages) {
        pages = sorted.length;
    }

    var s = '';
    let embed = new MessageEmbed();
    embed.setColor(3447003).setTitle(`Bot running for ${printTime(data.time)}`);
    var page = 1;
    for (var i = 0; i < sorted.length && i < pages; i++) {
        s = '';
        for (var j = 0; (j < (sorted[i][1] / max) * 40) || (j < 1); j++) {
            s += String.fromCharCode(10074);
        }
        embed.addField(`${sorted[i][0]} - played for ${printTime(sorted[i][1])}`, s);
        if ((embed.fields.length % 20 == 0 || i == sorted.length - 1) && embed.fields.length > 0) {
            interaction.channel.send({ embeds: [embed] });
            page++;
            embed = new MessageEmbed();
            embed.setColor(3447003).setTitle(`page ${page}`);
        }
    }
    interaction.reply({ content: 'Stats sent', ephemeral: true });
}

function printTime(time) {
    return `${parseInt(time / 60)}hr${time % 60}min`;
}