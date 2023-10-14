const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const { startGamemode } = require('./_mtg');
const schemes = JSON.parse(fs.readFileSync('resources/mtg/schemes.json')).planes;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-scheme')
		.setDescription('Run a MTG scheme gamemode'),
        
	async execute(client, interaction) {
		startGamemode(interaction, schemes, "Scheme");
	},
};