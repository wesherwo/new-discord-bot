const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const tournament = require('./_tournamentMain.js');

var players = [];
var tempPlayers = [];
var teams = [];
var teamNames = [];
var teamImg = [];
var teamsScore = -1;
var teamNum = 0;
var subsNum = 0;
var playersPerTeam = 1;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-make')
		.setDescription('Makes Teams/Matches/Channels')
		.addSubcommand(subcommand =>
			subcommand.setName('teams')
				.setDescription('Places the entered players into teams'))
		.addSubcommand(subcommand =>
			subcommand.setName('matches')
				.setDescription('Creates creates matches for the tournament')
				.addStringOption(option => option.setName('tournament-type')
					.setDescription('single/double/round-robin')
					.addChoices({name: 'single-elimination', value: 'single'},
								{name: 'double-elimination', value: 'double'},
								{name: 'round-robin', value: 'round'})
					.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('channels')
				.setDescription('Creates voice channels for each team')),
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'teams') {
			await interaction.deferReply();
			makeTeams(interaction);
		} else if (interaction.options.getSubcommand() == 'matches') {
			makeMatches(interaction);
		} else if (interaction.options.getSubcommand() == 'channels') {
			makeChannels(interaction);
		}
	},
};

async function makeTeams(interaction) {
	let icons = tournament.getIcons();
	randomShuffle(icons);
	players = tournament.getPlayers();
	playersPerTeam = tournament.getPlayersPerTeam();
	if (!(players.length >= playersPerTeam * 2)) {
		interaction.reply({ content: 'Not enough players signed up', ephemeral: true });
		return;
	}
	teams = [];
	teamNames = [];
	teamImg = [];
	teamNum = Math.floor(players.length / playersPerTeam);
	subsNum = players.length - (teamNum * playersPerTeam);
	teamsScore = -1;
	//console.log(totalCombos(playersPerTeam, teamNum));
	let shuffles = 500000 * Math.log2(teamNum);
	//console.log(shuffles);
	if (tournament.getMatchmakingType() == 'ow') {
		let dps = [];
		let tank = [];
		let support = [];
		let flex = [];
		for (let i = 0; i < players.length; i++) {
			if (players[i].role === 'dps') { dps.push(i); }
			else if (players[i].role === 'tank') { tank.push(i); }
			else if (players[i].role === 'support') { support.push(i); }
			else if (players[i].role === 'flex') { flex.push(i); }
		}
		for (let i = 0; i < shuffles; i++) {
			randomShuffle(dps);
			randomShuffle(tank);
			randomShuffle(support);
			randomShuffle(flex);
			tempPlayers = dps.concat(tank).concat(support).concat(flex);
			scoreTeams(i);
		}
	} else {
		for (let i = 0; i < players.length; i++) {
			tempPlayers.push(i);
		}
		for (let i = 0; i < shuffles; i++) {
			randomShuffle(tempPlayers);
			scoreTeams(i);
		}
	}
	for (let i = 0; i < teamNum; i++) {
		teamNames.push('Team' + (i + 1));
		teamImg.push(icons[i % icons.length]);
	}
	await interaction.editReply((teamNum + ' Teams have been created'));
	tournament.setTeamNum(teamNum);
	tournament.setTeams(teams);
	tournament.setTeamNames(teamNames);
	tournament.setTeamIcons(teamImg);
}

function scoreTeams(shuff) {
	let teamMMR = [];
	//make the teams and get avg MMR
	for (let i = 0; i < teamNum; i++) {
		let avgMMR = 0;
		for (let j = 0; j < playersPerTeam; j++) {
			avgMMR += players[tempPlayers[i + (j * teamNum)]].rank;
		}
		teamMMR.push(avgMMR / playersPerTeam);
	}
	//score the current teams based on MMR
	let MMRScore = 0;
	for (let i = 0; i < teamNum; i++) {
		for (let j = i + 1; j < teamNum; j++) {
			MMRScore += Math.abs(teamMMR[i] - teamMMR[j]) / teamNum;
		}
	}
	//given a better score sets new lineup
	if (teamsScore > MMRScore || teamsScore < 0) {
		//console.log(MMRScore + ' - ' + shuff);
		teams = [];
		for (let i = 0; i < teamNum; i++) {
			teams[i] = [];
			for (let j = 0; j < playersPerTeam; j++) {
				teams[i].push(players[tempPlayers[i + (j * teamNum)]]);
			}
		}
		//subs
		for (let i = 1; i <= subsNum; i++) {
			teams[i % teamNum].push(players[tempPlayers.length - i]);
		}
		teamsScore = MMRScore;
	}
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


function makeMatches(interaction) {
	if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams not created', ephemeral: true });
		return;
	}
	tournament.resetMatches();
	let type = interaction.options.getString('tournament-type');
	if (type == 'single') {
		singleElimination(tournament.getTeamNames(), 0);
	} else if (type == 'double') {
		doubleElimination(tournament.getTeamNames(), [], 0, 0);
	} else if (type == 'round') {
		roundRobin(tournament.getTeamNames(), 0);
	}
	tournament.setMatchesCreated(true);
	interaction.reply({ content: 'Matches created', ephemeral: true });
}

function singleElimination(teams, games) {
	if (teams.length == 2) {
		tournament.addMatch([teams[0], teams[1]]);
	} else {
		for (var i = 0; i < teams.length; i += 2) {
			tournament.addMatch([teams[i], teams[i + 1]]);
		}
		var newTeams = [];
		if (teams.length % 2 == 1) {
			newTeams.push(teams[teams.length - 1]);
		}
		for (var i = games; i < tournament.getMatches().length; i++) {
			newTeams.push('Winner of Game' + (games + i + 1));
		}
		singleElimination(newTeams, tournament.getMatches().length);
	}
}

function doubleElimination(winners, losers, upperGames, lowerGames) {
	if (winners.length == 1) {
		tournament.addMatch([winners[0], losers[0]]);
	} else {
		newLowerGames = lowerGames;
		for (var i = 0; i < losers.length; i += 2) {
			tournament.addMatch([losers[i], losers[i + 1]]);
			newLowerGames++;
		}
		var newLosers = [];
		if (teams.length % 2 == 1) {
			newLosers.push(losers[losers.length - 1]);
		}
		for (var i = lowerGames; i < newLowerGames; i++) {
			newLosers.push('Winner Lower Game' + (lowerGames + i + 1));
		}

		newUpperGames = upperGames;
		for (var i = 0; i < winners.length; i += 2) {
			tournament.addMatch([winners[i], winners[i + 1]]);
			newUpperGames++;
		}
		var newWinners = [];
		if (teams.length % 2 == 1) {
			newWinners.push(winners[winners.length - 1]);
		}
		for (var i = upperGames; i < newUpperGames; i++) {
			newWinners.push('Winner Upper Game' + (upperGames + i + 1));
			newLosers.splice((i * 2 + 1), 0, 'Loser of Upper Game' + (upperGames + i + 1));
		}
		doubleElimination(newWinners, newLosers, newUpperGames, newLowerGames);
	}
}

function roundRobin(teams, rounds) {
	if (teams.length % 2 != 0) {
		teams.push(null);
	}
	var half = teams.length / 2;
	for (var i = 0; i < half; i++) {
		tournament.addMatch([teams[i], teams[i + half]]);
	}
	var temp1 = teams.shift();
	var temp2 = teams.pop();
	teams.unshift(temp1, temp2);
	if (rounds < teams.length - 1) {
		roundRobin(teams, rounds + 1);
	}
}

function makeChannels(interaction) {
	if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams not created', ephemeral: true });
		return;
	}
	let teams = tournament.getTeams();
	let teamNames = tournament.getTeamNames();
	for (let i = 0; i < teams.length; i++) {
		if (interaction.guild.channels.cache.find(val => val.name === teamNames[i]) === undefined) {
			interaction.guild.channels.create({ name: teamNames[i], type: ChannelType.GuildVoice });
		}
	}
	interaction.reply({ content: 'Channels created', ephemeral: true });
}

function totalCombos(playersPerTeam, teams) {
	let x = 0;
	for (let i = teams; i > 0; i--) {
		x += combinations(i * playersPerTeam, playersPerTeam);
	}
	return x;
}

function combinations(n, k) {
	if (n == k) {
		return 1;
	} else {
		k = Math.max(k, n - k);
		return productRange(k + 1, n) / productRange(1, n - k);
	}
}

function productRange(a, b) {
	var product = a, i = a;

	while (i++ < b) {
		product *= i;
	}
	return product;
}