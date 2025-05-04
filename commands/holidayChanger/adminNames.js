const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultName, updateName, removeName, printNicknames } = require('./names');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin-name')
		.setDescription('Edit holiday names for a user')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default nickname when it is not a holiday')
				.addUserOption(option => option.setName('user').setDescription('User for the default name').setRequired(true))
				.addStringOption(option => option.setName('name').setDescription('Users default nickname').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('update')
				.setDescription('Updates a nickname for a holiday')
				.addUserOption(option => option.setName('user').setDescription('User for the default name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Removes a nickname for a holiday')
				.addUserOption(option => option.setName('user').setDescription('User for the default name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('print')
				.setDescription('Displays holiday names for a user')
				.addUserOption(option => option.setName('user').setDescription('User for the default name').setRequired(true))),
		
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'default') {
			defaultName(interaction, interaction.options.getMember('user').id);
		} else if (interaction.options.getSubcommand() == 'update') {
			updateName(interaction, interaction.options.getMember('user').id);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeName(interaction, interaction.options.getMember('user').id);
		} else if (interaction.options.getSubcommand() == 'print') {
			printNicknames(interaction, interaction.options.getMember('user').id);
		}
	},
};