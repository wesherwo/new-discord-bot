module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
		if(interaction.type == 3) {
			console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered a ${interaction.customId}.`);
		} else {
			console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered a ${interaction.commandName}.`);
		}

		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(client, interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};