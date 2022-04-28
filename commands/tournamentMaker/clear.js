const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');

const defaultChannel = JSON.parse(fs.readFileSync("resources/moduleResources/tournyMaker.json"))["defaultChannel"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-clear')
		.setDescription('Resets the tournament and removes the created channels'),
	async execute(interaction) {
		clear(interaction);
	},
};

function clear(interaction) {
	let defaultChannelID = interaction.guild.channels.cache.find(chan => chan.name === defaultChannel);
	let chans = [];
    let teamNames = tournament.getTeamNames();
    let teams = tournament.getTeams();
	for (var i = 0; i < teams.length; i++) {
		let chan = interaction.guild.channels.cache.find(chan => chan.name === teamNames[i]);
		if (chan != null) {
			chans.push(chan);
		}
	}
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j][3] != null) {
				for (var k = 0; k < chans.length; k++) {
					if (chans[k] == teams[i][j][3].voiceChannel) {
						teams[i][j][3].voice.setChannel(defaultChannelID);
					}
				}
			}
		}
	}
    tournament.reset();
	for (var i = 0; i < chans.length; i++) {
		chans[i].delete();
	}
}