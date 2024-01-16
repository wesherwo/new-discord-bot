const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidayNames, setHolidayNames, setDefaultName, addName, removeName, printNames, updateForNameChange } = require('./_holidayNameChanger');

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
			subcommand.setName('add')
				.setDescription('Adds a new nickname for a holiday')
                .addUserOption(option => option.setName('user').setDescription('User for the holiday name').setRequired(true))
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Users nickname for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a nickname for a holiday')
                .addUserOption(option => option.setName('user').setDescription('User for the holiday name').setRequired(true))
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .addUserOption(option => option.setName('user').setDescription('User to print names for').setRequired(true))
                .setDescription('Displays holiday names for a user')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'default') {
			defaultName(interaction);
        } else if (interaction.options.getSubcommand() == 'add') {
			addHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printHolidayNames(interaction);
		}
	},
};

function defaultName(interaction) {
    var names = setDefaultName(getHolidayNames(), interaction.options.getMember('user').id, interaction.options.getString('name'), interaction);
    setHolidayNames(names);
    updateForNameChange("default", interaction.options.getMember('user').id);
}

function addHolidayName(interaction) {
    var names = addName(getHolidayNames(), interaction.options.getMember('user').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getString('name'), interaction);
    setHolidayNames(names);
    updateForNameChange(interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getMember('user').id);
}

function removeHolidayName(interaction) {
    var names = removeName(getHolidayNames(), interaction.options.getMember('user').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction);
    setHolidayNames(names);
    updateForNameChange('default', interaction.options.getMember('user').id);
}

function printHolidayNames(interaction) {
    var names = getHolidayNames();
    if(!names[interaction.options.getMember('user').id]) {
        interaction.reply({ content: "They don't have any holiday names", ephemeral: true });
        return;
    }
    var output = printNames(names[interaction.options.getMember('user').id]);
    interaction.reply({ content: output.trim(), ephemeral: true });
}