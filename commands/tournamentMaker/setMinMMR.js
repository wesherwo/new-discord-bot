const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-set-min-mmr')
		.setDescription('Sets the minimum mmr for the tournament')
        .addIntegerOption(option => option.setName('mmr').setDescription('Minimun MMR').setRequired(true)),
	async execute(interaction) {
		tournament.setMinMMR(interaction.options.getInteger('mmr'));
        tournament.setIcons(JSON.parse(fs.readFileSync('resources/defaultImages/')).images);
        interaction.reply({ content: 'Min MMR set', ephemeral: true });
	},
};