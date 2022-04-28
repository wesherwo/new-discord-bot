const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
var leaveMsgs = settings['leaveMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-leave')
		.setDescription('Removes user from the tournament'),
	async execute(interaction) {
		leave(interaction);
	},
};

function leave(interaction) {
	let name = interaction.author.username;
	if(tournament.removePlayer(name)) {
        interaction.reply(name + leaveMsgs[Math.floor(Math.random() * leaveMsgs.length)]);
        interaction.reply({ content: 'You have left the tournament', ephemeral: true });
    } else {
        interaction.reply({ content: 'You are not entered in the tournament', ephemeral: true });
    }
}