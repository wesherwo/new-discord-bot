const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-move-players')
		.setDescription('Moves praticipants to their team channels'),
	async execute(interaction) {
		movePlayers(interaction);
	},
};

function movePlayers(interaction) {
    let teams = tournament.getTeams();
    let teamNames = tournament.getTeamNames();
	for (var i = 0; i < teams.length; i++) {
		let chan = interaction.guild.channels.chach.find(chan => chan.name === teamNames[i]);
		for (var j = 0; j < teams[i].length; j++) {
			if (!teams[i][j][2].voice.channel) {
				teams[i][j][2].voice.setChannel(chan);
			}
		}
	}
    interaction.reply({ content: 'Players moved', ephemeral: true });
}