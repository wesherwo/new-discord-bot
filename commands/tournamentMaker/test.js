const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');
const presets = JSON.parse(fs.readFileSync("Resources/ModuleResources/tournyMaker.json")).presets;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-test')
		.setDescription('Helps test the tournament')
        .addStringOption(option => option.setName('preset')
			.setDescription('preset')
			.addChoice('Rocket League 3s', 'Rocket League 3s')
			.addChoice('Rocket League 2s', 'Rocket League 2s')
			.setRequired(true)),
	async execute(interaction) {
		test(interaction);
	},
};

function test(interaction) {
	tournament.reset();
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
		}
	}

	var num = tournament.getPlayersPerTeam() * 2;
	var name = '';
	var rank = -1;
	for (var i = 0; i < num; i++) {
		name = 'Player' + i;
		rank = Math.floor(Math.random() * tournament.getMaxMMR());
		tournament.join([name, rank, null]);
	}
	interaction.reply({ content: 'Test teams created', ephemeral: true });
}