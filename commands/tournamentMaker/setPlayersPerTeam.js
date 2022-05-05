const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-players-per-team')
		.setDescription('Sets the number of players per team')
        .addIntegerOption(option => option.setName('players').setDescription('Number of players per team').setRequired(true)),
	async execute(client, interaction) {
		if(interaction.options.getInteger('players') < 1) {
			interaction.reply({ content: 'Must be at least one player per team', ephemeral: true });
			return;
		}
		tournament.setPlayersPerTeam(interaction.options.getInteger('players'));
        tournament.setIcons(JSON.parse(fs.readFileSync('resources/images/defaultImages.json')).images);
        interaction.reply({ content: 'Players per team set', ephemeral: true });
	},
};