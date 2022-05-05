const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-move-players')
		.setDescription('Moves praticipants to their team channels'),
	async execute(client, interaction) {
		movePlayers(interaction);
	},
};

function movePlayers(interaction) {
    let teams = tournament.getTeams();
    let teamNames = tournament.getTeamNames();
	for (var i = 0; i < teams.length; i++) {
		let chan = interaction.guild.channels.cache.find(chan => chan.name === teamNames[i]);
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j].member != null && teams[i][j].member.voice.channel != null) {
				teams[i][j].member.voice.setChannel(chan);
			}
		}
	}
    interaction.reply({ content: 'Players moved', ephemeral: true });
}