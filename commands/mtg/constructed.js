const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPacks, setExists } = require('./_mtg');

var bot;
var currentConstructedMessage = null;
var constructedSets = null;
var type = null;
var constructedModifier = null;
var players = {};
var playerList = [];
var packs = [];
var matches = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-constructed')
		.setDescription('Run a MTG constructed event')
        .addSubcommand(subcommand =>
			subcommand.setName('create')
				.setDescription('Creates a magic the gathering construct')
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
                .setDescription('Starts the current construct'))
        .addSubcommand(subcommand =>
            subcommand.setName('make-matches')
                .setDescription('Makes a bracket for the current construct'))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Stops the current construct')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'create') {
			createConstructed(interaction);
		} else if (interaction.options.getSubcommand() == 'start') {
			tenSecStart(interaction);
		} else if (interaction.options.getSubcommand() == 'delete') {
			deleteConstructed(interaction);
		} else if (interaction.options.getSubcommand() == 'make-matches') {
            makeMatches();
        }
	},
};

module.exports.startup = (client) => {
    bot = client;
}

async function createConstructed(interaction) {
    if (!currentConstructedMessage) {
        constructedSets = interaction.options.getString('setlist').split(',');
        var setListGood = true;
        constructedSets.forEach(set => {
            if(!setExists(set)) {
                setListGood = false;
                interaction.reply({ content: set + ' is not a valid set', ephemeral: true });
            }
        });
        if(!setListGood) {
            return;
        }
        type = interaction.options.getString('bracket');
        constructedModifier = interaction.options.getString('modifier');
        interaction.reply(`React to this message to sign up for a magic the gathering draft`);
        message = await interaction.fetchReply();
        currentConstructedMessage = message;
    } else {
        interaction.reply({ content: 'There is already a constructed event running', ephemeral: true });
    }
}

function deleteConstructed(interaction) {
    if (!currentConstructedMessage) {
        interaction.reply({ content: 'There is no constructed event to delete', ephemeral: true });
    } else {
        resetConstructed();
        interaction.reply({ content: 'The constructed event has been deleted', ephemeral: true });
    }
}

async function tenSecStart(interaction) {
    await getPlayers();
    setTimeout(startConstructed, 1000, interaction);
}

function startConstructed(interaction) {
    packs = getPacks(Object.keys(players).length * 3, constructedSets, constructedModifier);
    interaction.reply({ content: 'The constructed event has begun!', ephemeral: true });
    for(var i in players) {
        playerList.push(players[i]);
    }
    for(var i = 0; i < playerList.length; i++) {
        sendDecklists(i);
    }
    resetConstructed();
}

function sendDecklists(user) {
    var deck = {};
    for(var i = 0; i < 3; i++) {
        var pack = packs[user + (user * i)];
        pack.forEach(card => {
            if(!deck[card['name']]) {
                deck[card['name']] = 0;
            }
            deck[card['name']]++;
        });
    }
    var deckString = '';
    for(card in deck) {
        deckString += deck[card] + ' ' + card + "\n";
    }
    players[playerList[user]].send("Copy this into cockatice for your deck. \n\n" + deckString);
}

function resetConstructed() {
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