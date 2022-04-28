const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-print-players')
		.setDescription('Displays the players entered in the tournament'),
	async execute(interaction) {
		printPlayers(interaction);
	},
};

function printPlayers(interaction) {
    let players = tournament.getPlayers();
	if (players.length == 0) {
		interaction.reply({ content: 'No player in the tournament', ephemeral: true });
		return;
	}
	players.sort(function (a, b) { return a[0].localeCompare(b[0]) });
	let s = [];
	s.push('```xl');
	s.push(players.length + ' Players');
	for (var i = 0; i < players.length; i++) {
		s.push(players[i][0] + ' - ' + players[i][1]);
	}
	s.push('```');
	interaction.reply(s.join('\n'));
}