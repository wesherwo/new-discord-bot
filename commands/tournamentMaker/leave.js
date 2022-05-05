const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
var leaveMsgs = settings['leaveMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-leave')
		.setDescription('Removes user from the tournament'),
	async execute(client, interaction) {
		leave(interaction);
	},
};

function leave(interaction) {
	let name = interaction.user.username;
	if(tournament.removePlayer(name)) {
        interaction.reply(interaction.member.displayName + leaveMsgs[Math.floor(Math.random() * leaveMsgs.length)]);
    } else {
        interaction.reply({ content: 'You are not entered in the tournament', ephemeral: true });
    }
}