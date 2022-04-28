const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin-flip')
		.setDescription('Flips a Coin'),
	async execute(interaction) {
		if(Math.random() > 0.5){
            interaction.reply('Heads!');
            return;
        }
        interaction.reply('Tails!');
	},
};