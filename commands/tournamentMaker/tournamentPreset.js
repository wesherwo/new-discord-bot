const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');
const presets = JSON.parse(fs.readFileSync("Resources/ModuleResources/tournyMaker.json")).presets;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-preset')
		.setDescription('Sets the preset for the tournament')
        .addStringOption(option => option.setName('preset')
			.setDescription('preset')
			.addChoice('Rocket League 3s', 'Rocket League 3s')
			.addChoice('Rocket League 2s', 'Rocket League 2s')
			.setRequired(true)),
	async execute(interaction) {
		setPreset(interaction);
	},
};

function setPreset(interaction) {
	tournament.reset();
	let type = interaction.options.getString('preset');
	for (var i = 0; i < presets.length; i++) {
		if(presets[i].name.toLowerCase() == type.toLowerCase()){
			tournament.setPlayersPerTeam(presets[i].players);
			tournament.setMinMMR(presets[i].min);
			tournament.setMaxMMR(presets[i].max);
			if(presets[i].hasOwnProperty("icons")) {
				tournament.setIcons(JSON.parse(fs.readFileSync(presets[i].icons)).images);
			}
			interaction.reply({ content: 'Preset loaded', ephemeral: true });
			return;
		}
	}
	interaction.reply({ content: 'Could not find preset', ephemeral: true });
}