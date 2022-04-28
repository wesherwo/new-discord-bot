const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-name-team')
		.setDescription('Name your team')
        .addStringOption(option => option.setName('name').setDescription('Your teams name').setRequired(true)),
	async execute(interaction) {
		nameTeam(interaction);
	},
};

function nameTeam(interaction) {
	let s = '';
	let newName = interaction.options.getString('name');
    let teams = tournament.getTeams();
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j][0] == interaction.member.username) {
				s += teamNames[i] + ' renamed to ' + newName;
                tournament.setTeamName(newName, i);
				interaction.reply(s);
				return;
			}
		}
	}
	interaction.reply({ content: 'Could not rename team', ephemeral: true });
}