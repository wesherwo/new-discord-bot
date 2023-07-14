const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getPacks, setExists, packMessage } = require('./_mtg');

var bot;
var currentDraftMessage = null;
var draftSets = null;
var type = null;
var draftModifier = null;
var players = {};
var playerList = [];
var packs = [];
var deckLists = {};
var currentPages = [];
var madeSelection = [];
var packCounter = 0;
var matches = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-draft')
		.setDescription('Edit holiday names for a user')
        .addSubcommand(subcommand =>
			subcommand.setName('create')
				.setDescription('Creates a magic the gathering draft')
                .addStringOption(option => option.setName('setlist').setDescription('List of sets to use (MOM, MAT, MID, VOW...)').setRequired(true))
                .addStringOption(option => option.setName('bracket').setDescription('bracket for the matches').setRequired(true)
			            .addChoices({name: 'Single Elminination', value: 'single'},
						    {name: 'Double Elminination', value: 'double'},
                            {name: 'Round Robin', value: 'round'}))
                .addStringOption(option => option.setName('modifier').setDescription('modifier for the packs')
			            .addChoices({name: 'Mythic Maddness', value: 'MM'},
						    {name: 'Common Causality', value: 'CC'})))
        .addSubcommand(subcommand =>
            subcommand.setName('start')
                .setDescription('Starts the current draft'))
        .addSubcommand(subcommand =>
            subcommand.setName('make-matches')
                .setDescription('Makes a bracket for the current draft'))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Stops the current draft'))
        .addSubcommand(subcommand =>
            subcommand.setName('one-pack')
                .setDescription('Generates a pack')
                .addStringOption(option => option.setName('setlist').setDescription('List of sets to use (MOM, MAT, MID, VOW...)').setRequired(true))
                .addStringOption(option => option.setName('modifier').setDescription('modifier for the packs')
                    .addChoices({name: 'Mythic Maddness', value: 'MM'},
						        {name: 'Common Causality', value: 'CC'}))),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'create') {
			createDraft(interaction);
		} else if (interaction.options.getSubcommand() == 'start') {
			tenSecStart(interaction);
		} else if (interaction.options.getSubcommand() == 'delete') {
			deleteDraft(interaction);
		} else if (interaction.options.getSubcommand() == 'one-pack') {
			onePack(interaction);
		} else if (interaction.options.getSubcommand() == 'make-matches') {
            makeMatches();
        }
	},
};

module.exports.startup = (client) => {
    bot = client;
}


async function createDraft(interaction) {
    if (!currentDraftMessage) {
        draftSets = interaction.options.getString('setlist').split(',');
        type = interaction.options.getString('bracket');
        draftModifier = interaction.options.getString('modifier');
        interaction.reply(`React to this message to sign up for a magic the gathering draft`);
        message = await interaction.fetchReply();
        currentDraftMessage = message;
    } else {
        interaction.reply({ content: 'There is already a draft running', ephemeral: true });
    }
}

function deleteDraft(interaction) {
    if (!currentDraftMessage) {
        interaction.reply({ content: 'There is no draft to delete', ephemeral: true });
    } else {
        resetDraft();
        interaction.reply({ content: 'The draft has been deleted', ephemeral: true });
    }
}

async function tenSecStart(interaction) {
    await getPlayers();
    setTimeout(startDraft, 1000, interaction);
}

function startDraft(interaction) {
    packs = getPacks(Object.keys(players).length, draftSets, draftModifier);
    playerList = [];
    for(var i in players) {
        playerList.push(players[i]);
        currentPages.push(0);
        madeSelection.push(false);
    }
    randomShuffle(playerList);
    interaction.reply({ content: 'The draft has begun!', ephemeral: true });
    sendPacks();
}

function sendPacks() {
    packs.push(packs.shift());
    for(var i = 0; i < playerList.length; i++) {
        sendToUser(i);
    }
}

function sendToUser(userNum) {
    var embeds = [];
    let embed = new EmbedBuilder();
    embed.setColor(3447003);
    for (var i = 0; i < packs[userNum].length; i++) {
        embed.setTitle(packs[userNum][i]['name']);
        embed.setImage(`https://www.mtgpics.com/pics/big/${packs[userNum][i]['set'].toLowerCase()}/${packs[userNum][i]['num']}.jpg`);
        embeds.push(embed);
        embed = new EmbedBuilder();
        embed.setColor(3447003);
    }
    currentPages[userNum] = 0;

    const prevButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:1081828598433992825>")
        .setStyle(ButtonStyle.Primary);

    var makeSelection = new ButtonBuilder()
        .setCustomId("makeSelection")
        .setLabel("Select (1" + "/" + packs[userNum].length + ")")
        .setStyle(ButtonStyle.Success);

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:next:1081828596844339251>")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder()
        .addComponents(prevButton, makeSelection, nextButton);

    var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == playerList[userNum].id);

    var userMsg;
    user.send({
        embeds: [embeds[0]],
        components: [buttons]
    }).then(msg => userMsg = msg);

    user.createDM().then(dm => {
        const collector = dm.createMessageComponentCollector({
            time: 300000, // 5 minute timeout
        });

        collector.on("collect", (interaction) => {
            if (interaction.customId === "previous") {
                currentPages[userNum]--;
                if (currentPages[userNum] < 0) currentPages[userNum] = 0;
                let embed = embeds[currentPages[userNum]];
                makeSelection.setLabel("Select (" + (currentPages[userNum] + 1) + "/" + packs[userNum].length + ")");
                interaction.update({
                    embeds: [embed],
                    components: [buttons]
                });
            } else if (interaction.customId === "next") {
                currentPages[userNum]++;
                if (currentPages[userNum] >= packs[userNum].length) currentPages[userNum] = packs[userNum].length - 1;
                let embed = embeds[currentPages[userNum]];
                makeSelection.setLabel("Select (" + (currentPages[userNum] + 1) + "/" + packs[userNum].length + ")");
                interaction.update({
                    embeds: [embed],
                    components: [buttons]
                });
            } else if (interaction.customId === "makeSelection") {
                collector.stop();
            }
        });

        collector.on("end", (collected) => {
            userMsg.edit({ components: [] });
            madeSelection[userNum] = true;
            checkAllSelected();
        });
    });
}

function checkAllSelected() {
    var allSelected = true;
    madeSelection.forEach(element => {
        if(!element) { allSelected = false; }
    });
    if(allSelected) {
        madeSelection = [];
        for(var i = 0; i < playerList.length; i++) {
            madeSelection.push(false);
            if(!deckLists[playerList[i].username]) {
                deckLists[playerList[i].username] = [];
            }
            deckLists[playerList[i].username] = deckLists[playerList[i].username].concat(packs[i].splice(currentPages[i],1));
        }
        if(packs[0].length == 0) {
            packCounter++;
            if(packCounter == 3) {
                makeDecklists();
                return;
            }
            packs = getPacks(Object.keys(players).length, draftSets, draftModifier);
        }
        sendPacks();
    }
}

function makeDecklists() {
    for(var user in deckLists) {
        sendDecklists(user);
    }
}

function sendDecklists(user) {
    var deck = {};
    deckLists[user].forEach(card => {
        if(!deck[card['name']]) {
            deck[card['name']] = 0;
        }
        deck[card['name']]++;
    });
    var deckString = '';
    for(card in deck) {
        deckString += deck[card] + ' ' + card + "\n";
    }
    players[user].send("Copy this into cockatice for your deck. \n\n" + deckString);
}

function randomShuffle(array) {
	let j, x;
	for (let i = array.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = array[i];
		array[i] = array[j];
		array[j] = x;
	}
}

function onePack(interaction) {
    var sets = interaction.options.getString('setlist').split(',');
    var setListGood = true;
    sets.forEach(set => {
        if(!setExists(set)) {
            setListGood = false;
            interaction.reply({ content: set + ' is not a valid set', ephemeral: true });
        }
    });
    if(!setListGood) { return; }
    var pack = getPacks(1, sets, interaction.options.getString('modifier'));
    packMessage(interaction, pack[0]);
}

function resetDraft() {
    currentDraftMessage.delete();
    currentDraftMessage = null;
    players = {};
    deckLists = {};
    currentPages = [];
    madeSelection = [];
    packCounter = 0;
    draftSets = null;
    draftModifier = null;
    type = null;
}

async function getPlayers() {
    message.reactions.cache.each(reaction => {
        reaction.users.fetch().then(getUsers => getUsers.each(user => {
            if(!players[user.username]){
                players[user.username] = user;
            }
        }));
    });
}

function makeMatches() {
    if (type == 'single') {
		singleElimination(getPlayerNames(), 0);
	} else if (type == 'double') {
		doubleElimination(getPlayerNames(), [], 0, 0);
	} else if (type == 'round') {
		roundRobin(getPlayerNames(), 0);
	}
    let s = '';
	let toSend = [];
	toSend.push('```xl');
	for (let i = 0; i < matches.length; i++) {
		s = '';
		s += 'Game' + (i + 1) + ' - ' + matches[i][0] + ' vs ' + matches[i][1] + '\n';
		toSend.push(s);
	}
	toSend.push('```');
	currentDraftMessage.channel.send(toSend.join('\n'));
}

function getPlayerNames() {
    return Object.keys(players);
}

function singleElimination(playerNames, games) {
	if (playerNames.length == 2) {
		matches.push([playerNames[0], playerNames[1]]);
	} else {
		for (var i = 0; i < playerNames.length; i += 2) {
			matches.push([playerNames[i], playerNames[i + 1]]);
		}
		var newplayerNames = [];
		if (playerNames.length % 2 == 1) {
			newplayerNames.push(playerNames[playerNames.length - 1]);
		}
		for (var i = games; i < matches.length; i++) {
			newplayerNames.push('Winner of Game' + (games + i + 1));
		}
		singleElimination(newplayerNames, matches.length);
	}
}

function doubleElimination(winners, losers, upperGames, lowerGames) {
	if (winners.length == 1) {
		matches.push([winners[0], losers[0]]);
	} else {
		newLowerGames = lowerGames;
		for (var i = 0; i < losers.length; i += 2) {
			matches.push([losers[i], losers[i + 1]]);
			newLowerGames++;
		}
		var newLosers = [];
		if (playerNames.length % 2 == 1) {
			newLosers.push(losers[losers.length - 1]);
		}
		for (var i = lowerGames; i < newLowerGames; i++) {
			newLosers.push('Winner Lower Game' + (lowerGames + i + 1));
		}

		newUpperGames = upperGames;
		for (var i = 0; i < winners.length; i += 2) {
			matches.push([winners[i], winners[i + 1]]);
			newUpperGames++;
		}
		var newWinners = [];
		if (playerNames.length % 2 == 1) {
			newWinners.push(winners[winners.length - 1]);
		}
		for (var i = upperGames; i < newUpperGames; i++) {
			newWinners.push('Winner Upper Game' + (upperGames + i + 1));
			newLosers.splice((i * 2 + 1), 0, 'Loser of Upper Game' + (upperGames + i + 1));
		}
		doubleElimination(newWinners, newLosers, newUpperGames, newLowerGames);
	}
}

function roundRobin(playerNames, rounds) {
	if (playerNames.length % 2 != 0) {
		playerNames.push(null);
	}
	var half = playerNames.length / 2;
	for (var i = 0; i < half; i++) {
		matches.push([playerNames[i], playerNames[i + half]]);
	}
	var temp1 = playerNames.shift();
	var temp2 = playerNames.pop();
	playerNames.unshift(temp1, temp2);
	if (rounds < playerNames.length - 1) {
		roundRobin(playerNames, rounds + 1);
	}
}