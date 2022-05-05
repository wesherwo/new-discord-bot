const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
var leaveMsgs = settings['leaveMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-kick')
		.setDescription('Removes a user from the tournament')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),
	async execute(client, interaction) {
		leave(interaction);
	},
};

function leave(interaction) {
	let member = interaction.options.getMember('target');
	let name = member.user.username;
	if(tournament.removePlayer(name)) {
        interaction.reply(member.displayName + leaveMsgs[Math.floor(Math.random() * leaveMsgs.length)]);
    } else {
        interaction.reply({ content: 'User is not in the tournament', ephemeral: true });
    }
}