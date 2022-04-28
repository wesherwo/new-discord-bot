const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-set-max-mmr')
		.setDescription('Sets the maximum mmr for the tournament')
        .addIntegerOption(option => option.setName('mmr').setDescription('Maximum MMR').setRequired(true)),
	async execute(interaction) {
		tournament.setMaxMMR(interaction.options.getInteger('mmr'));
        tournament.setIcons(JSON.parse(fs.readFileSync('resources/defaultImages/')).images);
        interaction.reply({ content: 'Min MMR set', ephemeral: true });
	},
};