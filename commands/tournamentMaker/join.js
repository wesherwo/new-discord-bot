const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('resources/moduleResources/tournyMaker.json'));
const joinMsgs = settings['joinMsgs'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-join')
		.setDescription('Enters user into the tournament')
        .addIntegerOption(option => option.setName('rank').setDescription('Your in game rank').setRequired(true)),
	async execute(interaction) {
		join(interaction);
	},
};

function join(interaction) {
	let minMMR = tournament.getMinMMR();
	let maxMMR = tournament.getMaxMMR();
	let rank = interaction.options.getInteger('rank');
	if (rank > maxMMR || rank < minMMR) {
		interaction.reply({ content: 'Must be a valid rank', ephemeral: true });
		return;
	}
	let name = interaction.user.username;
	let player = [name, rank, interaction.member];
	for (let i = 0; i < tournament.getPlayers().length; i++) {
		if (tournament.getPlayers()[i][0] == player[0]) {
            interaction.reply({ content: 'You are already signed up', ephemeral: true });
			return;
		}
	}
	tournament.join(player);
	interaction.reply(name + joinMsgs[Math.floor(Math.random() * joinMsgs.length)]);
}