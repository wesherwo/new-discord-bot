const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-print-teams')
		.setDescription('Displays teams for the tournament'),
	async execute(interaction) {
		printTeams(interaction);
	},
};

function printTeams(interaction) {
	if (!tournament.teamsCreated()) {
		interaction.reply({ content: 'Teams have not been created', ephemeral: true });
		return;
	}
	for (var i = 0; i < tournament.getTeamNum(); i++) {
		interaction.channel.send({embeds: [tournament.makeTeamEmbed(i)]});
	}
	interaction.reply({ content: 'Teams sent', ephemeral: true });
}