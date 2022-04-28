const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-team-stats')
		.setDescription('Displays stats for teams'),
	async execute(interaction) {
		printTeamData(interaction);
	},
};

function printTeamData(interaction) {
    if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams have not been created', ephemeral: true });
		return;
	}
    let teams = tournament.getTeams();
    let teamNames = tournament.getTeamNames();
    let playersPerTeam = tournament.getPlayersPerTeam();
	let s = '';
	let toSend = [];
	toSend.push('```xl');
	for (let i = 0; i < teams.length; i++) {
		s = '';
		s += teamNames[i] + ' - ';
		let avgMMR = 0;
		for (let j = 0; j < teams[i].length; j++) {
			s += teams[i][j][0];
			if (j < teams[i].length - 1) {
				s += ', ';
			}
			avgMMR += teams[i][j][1];
		}
		toSend.push(s);
		toSend.push(Math.floor((avgMMR / playersPerTeam)));
	}
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}