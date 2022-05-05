const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-set-mmr')
		.setDescription('Sets the mmr for the tournament')
		.addSubcommand(subcommand =>
			subcommand.setName('min')
			.setDescription('Sets the minimum MMR')
			.addIntegerOption(option => option.setName('min').setDescription('Minimum MMR').setRequired(true)))
			.addSubcommand(subcommand =>
				subcommand.setName('max')
				.setDescription('Sets the maximun MMR')
				.addIntegerOption(option => option.setName('max').setDescription('Maximum MMR').setRequired(true))),
	async execute(client, interaction) {
		if(interaction.options.getSubcommand() == 'min') {
			if(tournament.getMaxMMR() <= interaction.options.getInteger('min')){
				interaction.reply({ content: 'Minimum must be less than maximum', ephemeral: true });
				return;
			}
			tournament.setMinMMR(interaction.options.getInteger('min'));
        	tournament.setIcons(JSON.parse(fs.readFileSync('resources/images/defaultImages.json')).images);
        	interaction.reply({ content: 'Minimum MMR set', ephemeral: true });
		} else if(interaction.options.getSubcommand() == 'max') {
			if(tournament.getMinMMR() >= interaction.options.getInteger('max')){
				interaction.reply({ content: 'Maximum must be greater than minimum', ephemeral: true });
				return;
			}
			tournament.setMaxMMR(interaction.options.getInteger('max'));
        	tournament.setIcons(JSON.parse(fs.readFileSync('resources/images/defaultImages.json')).images);
        	interaction.reply({ content: 'Maximum MMR set', ephemeral: true });
		}
	},
};