const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

var players = [];
var teams = [];
var teamNames = [];
var teamImg = [];
var teamsScore = -1;
var teamNum = 0;
var subsNum = 0;
var playersPerTeam = 1;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-make-teams')
		.setDescription('Places the entered players into teams and creates seperate voice channels for each team'),
	async execute(interaction) {
		makeTeams(interaction);
        makeChannels(interaction);
	},
};

function makeTeams(interaction) {
    icons = randomShuffle(tournament.getIcons());
    players = tournament.getPlayers();
	playersPerTeam = tournament.getPlayersPerTeam();
	teams = [];
	teamNames = [];
	teamImg = [];
	teamNum = Math.floor(players.length / playersPerTeam);
	subsNum = players.length - (teamNum * playersPerTeam);
	teamsScore = -1;
	for (let i = 0; i < 1000 * teamNum * teamNum; i++) {
		players = randomShuffle(players);
        scoreTeams(players);
	}
	for (let i = 0; i < teamNum; i++) {
		teamNames.push('Team' + (i + 1));
		teamImg.push(icons[i % icons.length]);
	}
	interaction.reply(teamNum + ' Teams have been created');
	tournament.setTeamNum(teamNum);
    tournament.setTeams(teams);
	tournament.setTeamNames(teamNames);
	tournament.setTeamIcons(teamImg);
}

function makeChannels(interaction) {
	for (let i = 0; i < teams.length; i++) {
		if (interaction.guild.channels.cache.at([teamNames[i]]) == undefined) {
			interaction.guild.channels.create(teamNames[i], {type:"GUILD_VOICE"});
		}
	}
}

function scoreTeams(players) {
	var tempTeams = [];
	var teamMMR = [];
	//make the teams and get avg MMR
	for (var i = 0; i < teamNum; i++) {
		var tempTeam = [];
		var avgMMR = 0;
		for (var j = 0; j < playersPerTeam; j++) {
			tempTeam.push(players[i + (j * teamNum)]);
			avgMMR += players[i + (j * teamNum)][1];
		}
		tempTeams.push(tempTeam);
		teamMMR.push(avgMMR / playersPerTeam);
	}
	//score the current teams based on MMR
	var MMRScore = 0;
	var n = 0;
	for (var i = 0; i < teamNum; i++) {
		for (var j = i; j < teamNum; j++) {
			if (i != j) {
				MMRScore += Math.abs(teamMMR[i] - teamMMR[j]);
				n++;
			}
		}
	}
	//given a better score sets new lineup
	if (teamsScore > MMRScore || teamsScore < 0) {
		teams = [];
		//subs
		for (var i = 1; i <= subsNum; i++) {
			tempTeams[i % teamNum].push(players[players.length - i]);
		}
		for (var i = 0; i < tempTeams.length; i++) {
			teams.push(tempTeams[i]);
		}
		teamsScore = MMRScore;
	}
}

function randomShuffle(array) {
	let j, x, i;
	for (let i = array.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = players[i];
		array[i] = array[j];
		array[j] = x;
	}
    return array;
}