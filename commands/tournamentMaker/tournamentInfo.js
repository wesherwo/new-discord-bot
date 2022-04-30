const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-info')
		.setDescription('Information for the tournament'),
	async execute(interaction) {
        interaction.reply({ content: `Players: ${tournament.getPlayersPerTeam()}, MMR range: ${tournament.getMinMMR()} - ${tournament.getMaxMMR()}`, ephemeral: true });
	},
};