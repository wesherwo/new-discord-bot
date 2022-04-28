const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
var icons = JSON.parse(fs.readFileSync('resources/images/defaultImages.json')).images;

var players = [];
var teams = [];
var teamNames = [];
var teamImg = [];
var matches = [];

var playersPerTeam = 1;
var minMMR = 0;
var maxMMR = 1;

var teamsCreated = false;
var matchesCreated = false;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-make-matches')
		.setDescription('Creates creates matches for the tournament')
		.addStringOption(option => option.setName('tournament-type')
			.setDescription('single/double/round-robin')
			.addChoice('single-elimination', 'single')
			.addChoice('double-elimination', 'double')
			.addChoice('round-robin', 'round')
			.setRequired(true)),
	async execute(interaction) {
		makeMatches(interaction);
	},
};

module.exports.setTeams = (createdTeams) => { teams = createdTeams; teamsCreated = true;}
module.exports.getTeams = () => { return teams; }

module.exports.setTeamNames = (createdTeamNames) => { teamNames = createdTeamNames; }
module.exports.getTeamNames = () => { return teamNames; }
module.exports.setTeamName = (newName, i) => { teamNames[i] = newName; }

module.exports.setTeamIcons = (createdIcons) => { teamImg = createdIcons; }
module.exports.getTeamIcons = () => { return teamImg; }
module.exports.setTeamIcon = (newIcon, i) => { teamImg[i] = newIcon; }

module.exports.setIcons = (newIcons) => { icons = newIcons; }
module.exports.getIcons = () => { return icons; }

module.exports.getPlayersPerTeam = () => { return playersPerTeam; }
module.exports.setPlayersPerTeam = (i) => { playersPerTeam = i; }

module.exports.getMinMMR = () => { return minMMR; }
module.exports.setMinMMR = (i) => { minMMR = i; }

module.exports.getMaxMMR = () => { return maxMMR; }
module.exports.setMaxMMR = (i) => { maxMMR = i; }

module.exports.getMatches = () => { return matches; }

module.exports.teamsCreated = () => { return teamsCreated; }

module.exports.matchesCreated = () => { return matchesCreated; }

module.exports.join = (player) => { players.push(player); }

module.exports.getPlayers = () => { return players; }

module.exports.getTeamNum = () => { return teamNum; }
module.exports.setTeamNum = (i) => { teamNum = i; }

module.exports.reset = () => {
	players = [];
	teams = [];
	teamNames = [];
	teamImg = [];
	matches = [];
	teamsScore = -1;
	teamNum = 0;
	subsNum = 0;
	teamsCreated = false;
	matchesCreated = false;
}

module.exports.removePlayer = (name) => {
	for (var i = 0; i < players.length; i++) {
		if (players[i][0] == name) {
			players.splice(i, 1);
			return true;
		}
	}
	return false;
}

module.exports.makeTeamEmbed = (t) => {
	let s = '';
	for (var j = 0; j < teams[t].length; j++) {
		s += teams[t][j][0];
		if (j < teams[t].length - 1) {
			s += ', ';
		}
	}
	let embed = new MessageEmbed();
	embed.setColor(13632027)
		.setDescription(s)
		.setThumbnail(teamImg[t])
		.setAuthor({ name: teamNames[t], iconURL: teamImg[t] });
	return embed;
}

function makeMatches(interaction) {
	let type = interaction.options.getString('tournament-type');
	if (type == 'single') {
		singleElimination(teamNames, 0);
	} else if (type == 'double') {
		doubleElimination(teamNames, [], 0, 0);
	} else if (type == 'round') {
		roundRobin(teamNames, 0);
	}
	matchesCreated = true;
}

function singleElimination(teams, games) {
	if (teams.length == 2) {
		matches.push([teams[0], teams[1]]);
	} else {
		for (var i = 0; i < teams.length; i += 2) {
			matches.push([teams[i], teams[i + 1]]);
		}
		var newTeams = [];
		if (teams.length % 2 == 1) {
			newTeams.push(teams[teams.length - 1]);
		}
		for (var i = games; i < matches.length; i++) {
			newTeams.push('Winner of Game' + (games + i));
		}
		singleElimination(newTeams, matches.length);
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
		if (teams.length % 2 == 1) {
			newLosers.push(losers[losers.length - 1]);
		}
		for (var i = lowerGames; i < newLowerGames; i++) {
			newLosers.push('Winner Lower Game' + (lowerGames + i));
		}

		newUpperGames = upperGames;
		for (var i = 0; i < winners.length; i += 2) {
			matches.push([winners[i], winners[i + 1]]);
			newUpperGames++;
		}
		var newWinners = [];
		if (teams.length % 2 == 1) {
			newWinners.push(winners[winners.length - 1]);
		}
		for (var i = upperGames; i < newUpperGames; i++) {
			newWinners.push('Winner Upper Game' + (upperGames + i));
			newLosers.splice((i * 2 + 1), 0, 'Loser of Upper Game'(upperGames + i));
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
		matches.push([teams[i], teams[i + half]]);
	}
	var temp1 = teams.shift();
	var temp2 = teams.pop();
	teams.unshift(temp1, temp2);
	if (rounds < teams.length - 1) {
		roundRobin(teams, rounds + 1);
	}
}