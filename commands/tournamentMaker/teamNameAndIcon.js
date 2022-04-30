const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-team')
		.setDescription('Changes your teams name ot icon')
		.addSubcommand(subcommand =>
			subcommand.setName('name')
			.setDescription('Name for your team')
        	.addStringOption(option => option.setName('name').setDescription('Your teams name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('icon')
			.setDescription('Link to cion for your team')
			.addStringOption(option => option.setName('icon').setDescription('Your teams new icon(link to image)').setRequired(true))),
	async execute(interaction) {
		if(interaction.options.getSubcommand() == 'name') {
			nameTeam(interaction);
		} else if(interaction.options.getSubcommand() == 'icon') {
			teamIcon(interaction);
		}
	},
};

function nameTeam(interaction) {
	if(!tournament.teamsCreated()){
		interaction.reply({ content: 'Teams not created', ephemeral: true });
		return;
	}
	let newName = interaction.options.getString('name');
    let teams = tournament.getTeams();
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j].name == interaction.user.username) {
				interaction.reply(tournament.getTeamNames()[i] + ' renamed to ' + newName);
                tournament.setTeamName(newName, i);
				return;
			}
		}
	}
	interaction.reply({ content: 'Could not rename team', ephemeral: true });
}

function teamIcon(interaction) {
	if(!tournament.teamsCreated()){
		interaction.reply({ content: 'Teams not created', ephemeral: true });
		return;
	}
	let newIcon = interaction.options.getString('icon');
    let teams = tournament.getTeams();
	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].length; j++) {
			if (teams[i][j].name == interaction.user.username) {
				interaction.reply('Icon changed');
				tournament.setTeamIcon(newIcon, i);
				return;
			}
		}
	}
	interaction.reply({ content: 'Could not change the team icon', ephemeral: true });
}