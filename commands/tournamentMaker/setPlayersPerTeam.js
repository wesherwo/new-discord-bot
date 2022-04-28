const { SlashCommandBuilder } = require('@discordjs/builders');
const tournament = require('./tournamentMaker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournament-players-per-team')
		.setDescription('Sets the number of players per team')
        .addIntegerOption(option => option.setName('players').setDescription('Number of players per team').setRequired(true)),
	async execute(interaction) {
		tournament.setPlayerPerTeam(interaction.options.getInteger('players'));
        tournament.setIcons(JSON.parse(fs.readFileSync('resources/defaultImages/')).images);
        interaction.reply({ content: 'Players per team set', ephemeral: true });
	},
};