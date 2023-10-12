const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { parseString } = require('xml2js');
const fs = require('node:fs');
const cardDataPath = 'resources/mtg/cards.xml';
const setsPath = 'resources/mtg/sets.json';
const cardPath = 'resources/mtg/cards.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-help')
		.setDescription('Displays mtg commands and how to use them'),
	async execute(client, interaction) {
		let embed = new EmbedBuilder();
        embed.setColor(3447003).setTitle('List of commands').addFields(
            [{ name: 'mtg-draft create', value: 'Creates a draft' },
            { name: 'mtg-draft start', value: 'Starts a draft' },
            { name: 'mtg-draft Delete', value: 'Deletes the draft' }]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

module.exports.startup = (client) => {
    //updateSets();
    //updateCards();
}

module.exports.getSets = () => {
    return JSON.parse(fs.readFileSync(setsPath));
}

module.exports.setExists = (set) => {
    return JSON.parse(fs.readFileSync(setsPath))[set.toUpperCase().trim()];
}

module.exports.getPacks = (numOfPacks, sets, modifier) => {
    var packs = [];
    for(var i = 0; i < numOfPacks; i++) {
        packs.push(generatePack(sets, modifier));
    }
    return packs;
}

module.exports.packMessage = (interaction, pack) => {
    var embeds = [];
    let embed = new EmbedBuilder();
    embed.setColor(3447003);
    for (var i = 0; i < pack.length; i++) {
        embed.setTitle(pack[i]['name']);
        embed.setImage(`https://mythicspoiler.com/${packs[userNum][i]['set'].toLowerCase()}/cards/${cardName}.jpg`);
        embeds.push(embed);
        embed = new EmbedBuilder();
        embed.setColor(3447003);
    }
    let currentPage = 0;

    const prevButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:1081828598433992825>")
        .setStyle(ButtonStyle.Primary);

    var pageNum = new ButtonBuilder()
        .setCustomId("pages")
        .setLabel("Page 1" + "/" + pack.length)
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
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + pack.length);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        } else if (interaction.customId === "next") {
            currentPage++;
            if (currentPage >= pack.length) currentPage = pack.length - 1;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + pack.length);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        }
    });

    collector.on("end", (collected) => { interaction.editReply({ components: [] });});
}

function updateSets() {
    parseString(fs.readFileSync(cardDataPath), function (err, results) {
        var sets = {};
        var setData = results['cockatrice_carddatabase']['sets'][0]['set'];
        setData.forEach(set => {
            sets[set['name']] = {'longname': set['longname'][0], 'releasedate': set['releasedate'][0]};
        });
        var jsonData = JSON.stringify(sets);
        fs.writeFileSync(setsPath, jsonData, function (err) { if (err) { console.log(err); } });
    });
}

function updateCards() {
    parseString(fs.readFileSync(cardDataPath), function (err, results) {
        var cards = {};
        var cardData = results['cockatrice_carddatabase']['cards'][0]['card'];
        cardData.forEach(card => {
            if(!card['prop'][0]['type'][0].includes('Basic Snow Land') && !card['prop'][0]['type'][0].includes('Basic Land') && !card['prop'][0]['side'][0].includes('back')) {
                card['set'].forEach(set => {
                    if(!cards[set['_']]) {
                        cards[set['_']] = {};
                    }
                    if(!cards[set['_']][set['$']['rarity']]) {
                        cards[set['_']][set['$']['rarity']] = [];
                    }
                    var cardNum = set['$']['num'];
                    if(parseInt(cardNum) < 10) {
                        cardNum = '00' + cardNum;
                    } else if(parseInt(cardNum) < 100) {
                        cardNum = '0' + cardNum;
                    }
                    cards[set['_']][set['$']['rarity']].push({'name': card['name'][0], 'set': set['_'], 'num': cardNum});
                });
            }
        });
        var jsonData = JSON.stringify(cards);
        fs.writeFileSync(cardPath, jsonData, function (err) { if (err) { console.log(err); } });
    });
}

function generatePack(setNames, modifier) {
    var sets = JSON.parse(fs.readFileSync(cardPath));
    var mythics = [];
    var rares = [];
    var uncommons = [];
    var commons = [];
    setNames.forEach(set => {
        set = set.toUpperCase().trim();
        if(sets[set]['mythic']) {
            sets[set]['mythic'].forEach(card => mythics.push(card));
        }
        if(sets[set]['rare']) {
            sets[set]['rare'].forEach(card => rares.push(card));
        }
        if(sets[set]['uncommon']) {
            sets[set]['uncommon'].forEach(card => uncommons.push(card));
        }
        if(sets[set]['common']) {
            sets[set]['common'].forEach(card => commons.push(card));
        }
    });

    var pack = [];
    //normal draft 10C 3U 1R
    if(!modifier) {
        for(var i = 0; i < 10; i++) {
            pack.push(commons[Math.floor(Math.random() * commons.length)]);
        }
        for(var i = 0; i < 3; i++) {
            pack.push(uncommons[Math.floor(Math.random() * uncommons.length)]);
        }
        rares = rares.concat(mythics);
        pack.push(rares[Math.floor(Math.random() * rares.length)]);
    //Mythic Maddness 14M
    } else if(modifier.localeCompare('MM') == 0) {
        if(mythics.length == 0) {
            mythics = rares;
        }
        for(var i = 0; i < 14; i++) {
            pack.push(mythics[Math.floor(Math.random() * mythics.length)]);
        }
    //Common Causality 14C
    } else if(modifier.localeCompare('CC') == 0) {
        for(var i = 0; i < 14; i++) {
            pack.push(commons[Math.floor(Math.random() * commons.length)]);
        }
    }
    return pack;
}