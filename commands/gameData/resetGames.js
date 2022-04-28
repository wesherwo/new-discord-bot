const { SlashCommandBuilder } = require('@discordjs/builders');
const gameData = require('./gameData.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset-server-game-info')
		.setDescription('Resets the servers game play time info'),
	async execute(interaction) {
		gameData.resetData(interaction);
	},
};