const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');
const fs = require('fs');
const presets = JSON.parse(fs.readFileSync("Resources/ModuleResources/tournyMaker.json")).presets;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-test')
		.setDescription('Helps test the tournament')
        .addStringOption(option => option.setName('preset')
			.setDescription('preset')
			.addChoice('Rocket League 3s', 'Rocket League 3s')
			.addChoice('Rocket League 2s', 'Rocket League 2s')
			.addChoice('Overwatch', 'Overwatch')
			.addChoice('Overwatch 2', 'Overwatch 2')
			.setRequired(true))
		.addIntegerOption(option => option.setName('teams').setDescription('Number of teams for testing').setRequired(true)),
	async execute(interaction) {
		test(interaction);
	},
};

function test(interaction) {
	tournament.reset();
	let type = interaction.options.getString('preset');
	for (var i = 0; i < presets.length; i++) {
		if(presets[i].name.toLowerCase() == type.toLowerCase()){
			tournament.setPlayersPerTeam(presets[i].players);
			tournament.setMinMMR(presets[i].min);
			tournament.setMaxMMR(presets[i].max);
			tournament.setMatchmakingType(presets[i].type);
			if(presets[i].hasOwnProperty("icons")) {
				tournament.setIcons(JSON.parse(fs.readFileSync(presets[i].icons)).images);
			}
		}
	}

	var num = tournament.getPlayersPerTeam() * interaction.options.getInteger('teams');
	var name = '';
	var rank = -1;
	for (var i = 0; i < num; i++) {
		name = 'Player' + (i + 1);
		rank = Math.floor(Math.random() * tournament.getMaxMMR());
		if(tournament.getMatchmakingType() == 'ow') {
			let roles = ['dps', 'tank', 'support', 'flex'];
			tournament.join({name:name, rank:rank, member:null, role:roles[Math.floor(Math.random() * 4)]});
		} else {
			tournament.join({name:name, rank:rank, member:null});
		}
		
	}
	interaction.reply({ content: 'Test players created', ephemeral: true });
}