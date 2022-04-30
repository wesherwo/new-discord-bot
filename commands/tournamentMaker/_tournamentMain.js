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
var matchmakingType = "normal";

var teamsCreated = false;
var matchesCreated = false;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-help')
		.setDescription('Shows commands for tournaments and how to use them to run a tournament'),
	async execute(interaction) {
		let embed = new MessageEmbed();
    	embed.setColor(3447003).setTitle('List of commands').addFields(
			[{name:'t-clear',value:'Resets the tournament and removes the created channels'},
			{name:'t-info',value:'Information for the tournament'},
			{name:'t-join',value:'Enters user into the tournament'},
            {name:'t-kick',value:'Removes a user from the tournament'},
			{name:'t-leave',value:'Removes user from the tournament'},
			{name:'t-make',value:'Creates team/matches/channels for the tournament'},
			{name:'t-move-players',value:'Moves praticipants to their team channels'},
			{name:'t-players-per-team',value:'Sets the number of players per team'},
			{name:'t-preset',value:'Sets the preset for the tournament'},
			{name:'t-print',value:'Displays players/teams/matches/team stats for the tournament'},
			{name:'t-set-mmr',value:'Sets the minimum/maximum mmr for the tournament'},
			{name:'t-team',value:'Change your teams name or icon'}]);
		interaction.channel.send({embeds: [embed]});

		interaction.channel.send('Basic usage:\n1. t-preset\n2. t-join\n3. t-make teams after all players are entered\n4. t-make matches\n5. t-print teams\n6. t-print matches');
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

module.exports.getMatchmakingType = () => { return matchmakingType; }
module.exports.setMatchmakingType = (type) => { matchmakingType = type; }

module.exports.getMatches = () => { return matches; }
module.exports.addMatch = (match) => { matches.push(match); }
module.exports.resetMatches = () => { matches = []; }

module.exports.teamsCreated = () => { return teamsCreated; }

module.exports.getMatchesCreated = () => { return matchesCreated; }
module.exports.setMatchesCreated = (bool) => { matchesCreated = bool; }

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
	playersPerTeam = 1;
	minMMR = 0;
	maxMMR = 1;
	teamsCreated = false;
	matchesCreated = false;
	matchmakingType = "normal";
}

module.exports.join = (player) => { players.push(player); }

module.exports.removePlayer = (name) => {
	for (var i = 0; i < players.length; i++) {
		if (players[i].name == name) {
			players.splice(i, 1);
			return true;
		}
	}
	return false;
}