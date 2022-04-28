const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-print-matches')
		.setDescription('Displays matches for the tournament'),
	async execute(interaction) {
		printMatches(interaction);
	},
};

function printMatches(interaction) {
	if (!tournament.matchesCreated()) {
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