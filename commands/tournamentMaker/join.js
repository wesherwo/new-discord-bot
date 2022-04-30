const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./_tournamentMain.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
const joinMsgs = settings['joinMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('t-join')
		.setDescription('Enters user into the tournament')
		.addSubcommand(subcommand =>
			subcommand.setName('normal')
			.setDescription('Enters user into an tournament')
			.addIntegerOption(option => option.setName('rank').setDescription('Your in game rank').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('overwatch')
			.setDescription('Enters user into an overwatch tournament')
			.addIntegerOption(option => option.setName('rank').setDescription('Your in game rank').setRequired(true))
			.addStringOption(option =>
				option.setName('role')
					.setDescription('Your role')
					.addChoice('DPS', 'dps')
					.addChoice('Tank', 'tank')
					.addChoice('Support', 'support')
					.addChoice('Flex', 'flex')
					.setRequired(true))),
	async execute(interaction) {
		join(interaction);
	},
};

function join(interaction) {
	let minMMR = tournament.getMinMMR();
	let maxMMR = tournament.getMaxMMR();
	let rank = interaction.options.getInteger('rank');
	let name = interaction.user.username;
	let player = {'name':name, 'rank':rank, 'member':interaction.member};
	if(tournament.getMatchmakingType() == 'normal' && !interaction.options.getSubcommand() == 'normal'){
		interaction.reply({ content: 'Must use the t-join normal command for this tournament', ephemeral: true });
		return;
	} else if(tournament.getMatchmakingType() == 'ow') {
		if(!interaction.options.getSubcommand() == 'overwatch'){
			interaction.reply({ content: 'Must use the t-join overwatch command for this tournament', ephemeral: true });
			return;
		}
		player.role = interaction.options.getString('role');
	}
	if (rank > maxMMR || rank < minMMR) {
		interaction.reply({ content: 'Must be a valid rank', ephemeral: true });
		return;
	}
	for (let i = 0; i < tournament.getPlayers().length; i++) {
		if (tournament.getPlayers()[i].name == player.name) {
            interaction.reply({ content: 'You are already signed up', ephemeral: true });
			return;
		}
	}
	tournament.join(player);
	interaction.reply(interaction.member.displayName + joinMsgs[Math.floor(Math.random() * joinMsgs.length)]);
}