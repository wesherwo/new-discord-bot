const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-team-icon')
		.setDescription('Change your teams icon')
        .addStringOption(option => option.setName('icon').setDescription('Your teams new icon(link to image)').setRequired(true)),
	async execute(interaction) {
		nameTeam(interaction);
	},
};

function nameTeam(interaction) {
	let newIcon = interaction.options.getString('icon');
    let teams = tournament.getTeams();
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j][0] == interaction.member.username) {
				tournament.setTeamIcon(newicon, i);
				interaction.reply('Icon changed');
				return;
			}
		}
	}
	interaction.reply({ content: 'Could not change the team icon', ephemeral: true });
}