const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-print')
		.setDescription('Displays info for the tournament')
		.addSubcommand(subcommand =>
			subcommand.setName('players')
				.setDescription('Displays players'))
		.addSubcommand(subcommand =>
			subcommand.setName('teams')
				.setDescription('Displays teams'))
		.addSubcommand(subcommand =>
			subcommand.setName('matches')
				.setDescription('Displays matches'))
		.addSubcommand(subcommand =>
			subcommand.setName('team-stats')
				.setDescription('Displays team stats')),
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'players') {
			printPlayers(interaction);
		} else if (interaction.options.getSubcommand() == 'teams') {
			printTeams(interaction);
		} else if (interaction.options.getSubcommand() == 'matches') {
			printMatches(interaction);
		} else if (interaction.options.getSubcommand() == 'team-stats') {
			printTeamData(interaction);
		}
	},
};

function printPlayers(interaction) {
	let players = tournament.getPlayers();
	if (players.length == 0) {
		interaction.reply({ content: 'No player in the tournament', ephemeral: true });
		return;
	}
	players.sort(function (a, b) { let name = a.name; return name.localeCompare(b.name) });
	let s = [];
	s.push('```xl');
	s.push(players.length + ' Players');
	players.forEach(player => {
		let playerString = '';
		// if is used in testing.  else is the normal option
		if (player.name.startsWith('Player')) {
			playerString = player.name;
		} else {
			playerString = interaction.guild.members.cache.find(val => val.user.username === player.name).displayName;
		}
		playerString += ' - ' + player.rank;
		if (tournament.getMatchmakingType() == 'ow') {
			playerString += ' - ' + player.role;
		}
		s.push(playerString);
	});
	s.push('```');
	interaction.reply(s.join('\n'));
}

function printTeams(interaction) {
	if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams have not been created', ephemeral: true });
		return;
	}
	for (let i = 0; i < tournament.getTeamNum(); i++) {
		interaction.channel.send({ embeds: [makeTeamEmbed(i, interaction)] });
	}
	interaction.reply({ content: 'Teams sent', ephemeral: true });
}

function makeTeamEmbed(t, interaction) {
	let teams = tournament.getTeams();
	let teamImg = tournament.getTeamIcons();
	let teamNames = tournament.getTeamNames();
	let s = '';
	for (let j = 0; j < teams[t].length; j++) {
		// if is used in testing.  else is the normal option
		if (teams[t][j].name.startsWith('Player')) {
			s += teams[t][j].name;
		} else {
			s += interaction.guild.members.cache.find(val => val.user.username === teams[t][j].name).displayName;
		}

		if (tournament.getMatchmakingType() == 'ow') { s += ` *(${teams[t][j].role})*`; }

		if (j < teams[t].length - 1) {
			s += ', ';
		}
	}
	let embed = new EmbedBuilder();
	embed.setColor(13632027)
		.setDescription(s)
		.setThumbnail(teamImg[t])
		.setAuthor({ name: teamNames[t], iconURL: teamImg[t] });
	return embed;
}

function printMatches(interaction) {
	if (!tournament.getMatchesCreated()) {
		interaction.reply({ content: 'Matches have not been created', ephemeral: true });
		return;
	}
	let matches = tournament.getMatches();
	let s = '';
	let toSend = [];
	toSend.push('```xl');
	for (let i = 0; i < matches.length; i++) {
		s = '';
		s += 'Game' + (i + 1) + ' - ' + matches[i][0] + ' vs ' + matches[i][1] + '\n';
		toSend.push(s);
	}
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}

function printTeamData(interaction) {
	if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams have not been created', ephemeral: true });
		return;
	}
	let teams = tournament.getTeams();
	let teamNames = tournament.getTeamNames();
	let s = '';
	let toSend = [];
	toSend.push('```xl');
	for (let i = 0; i < teams.length; i++) {
		s = '';
		s += teamNames[i] + ' - ';
		let avgMMR = 0;
		for (let j = 0; j < teams[i].length; j++) {
			if (tournament.getMatchmakingType() == 'ow') { s += `${teams[i][j].role}`; }
			else {
				// if is used in testing.  else is the normal option
				if (teams[i][j].name.startsWith('Player')) {
					s += teams[i][j].name;
				} else {
					s += interaction.guild.members.cache.find(val => val.user.username === teams[i][j].name).displayName;
				}
			}

			if (j < teams[i].length - 1) {
				s += ', ';
			}
			avgMMR += teams[i][j].rank;
		}
		toSend.push(s);
		toSend.push(Math.floor((avgMMR / teams[i].length)));
	}
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}