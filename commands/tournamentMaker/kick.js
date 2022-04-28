const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
var leaveMsgs = settings['leaveMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-kick')
		.setDescription('Removes a user from the tournament')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),
	async execute(interaction) {
		leave(interaction);
	},
};

function leave(interaction) {
	let name = interaction.options.getMember('target').username;
	if(tournament.removePlayer(name)) {
        interaction.reply(name + leaveMsgs[Math.floor(Math.random() * leaveMsgs.length)]);
        interaction.reply({ content: 'You havs been kicked from the tournament', ephemeral: true });
    } else {
        interaction.reply({ content: 'User is not in the tournament', ephemeral: true });
    }
}