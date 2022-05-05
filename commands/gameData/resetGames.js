const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = 'saveData/gameData.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset-server-game-info')
		.setDescription('Resets the servers game play time info'),
	async execute(client, interaction) {
		resetData(interaction);
	},
};

function resetData(interaction) {
    var jsonData = JSON.stringify({ 'time': 0, 'gametime': {} });
    fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
    interaction.reply({ content: 'Game data reset', ephemeral: true });
}