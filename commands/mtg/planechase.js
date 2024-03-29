const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const { startGamemode } = require('./_mtg');
const planes = JSON.parse(fs.readFileSync('resources/mtg/planes.json')).planes;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-planechase')
		.setDescription('Run a MTG planechase'),
        
	async execute(client, interaction) {
		startGamemode(interaction, planes, "Plane");
	},
};