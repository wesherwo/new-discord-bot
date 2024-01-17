const { SlashCommandBuilder } = require('@discordjs/builders');
const { setDefaultIcon, getHolidayIcons, setHolidayIcons, addIcon, removeIcon, printIcons, updateForIconChange } = require('./_holidayNameChanger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-server-icon')
		.setDescription('Edit holiday icon for the server')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default icon when it is not a holiday')
                .addStringOption(option => option.setName('image-link').setDescription('Icon for when its not a holiday').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new icon for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addStringOption(option => option.setName('image-link').setDescription('Icon for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a icon for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the icon removal').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday icons')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'default') {
			defaultIcon(interaction);
        } else if (interaction.options.getSubcommand() == 'add') {
			addHolidayIcon(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHolidayIcon(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printHolidayIcons(interaction);
		}
	},
};

function defaultIcon(interaction) {
    var icons = setDefaultIcon(getHolidayIcons(), interaction.options.getString('image-link'), interaction);
    setHolidayIcons(icons);
    updateForIconChange('default');
}

function addHolidayIcon(interaction) {
    var icons = addIcon(getHolidayIcons(), interaction.options.getString('image-link'), interaction.options.getString('holiday').toLowerCase().trim(), interaction);
    if(icons) {
        setHolidayIcons(icons);
        updateForIconChange(interaction.options.getString('holiday').toLowerCase().trim());
    }
}

function removeHolidayIcon(interaction) {
    var icons = removeIcon(getHolidayIcons(), interaction.options.getString('holiday').toLowerCase().trim(), interaction);
    if(icons) {
        setHolidayIcons(icons);
        updateForIconChange('default');
    }
}

function printHolidayIcons(interaction) {
    printIcons(interaction);
}