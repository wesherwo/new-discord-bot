const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidayNames, setHolidayNames, holidayExists, sortedHolidays } = require('./_holidayNameChanger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-name')
		.setDescription('Edit holiday names for a user')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default nickname when it is not a holiday')
                .addStringOption(option => option.setName('name').setDescription('Users nickname for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Users nickname for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('replace')
                .setDescription('Replaces a nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Users new nickname for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday names')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'default') {
			defaultName(interaction);
        } else if (interaction.options.getSubcommand() == 'add') {
			addHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'replace') {
			changeHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printNames(interaction);
		}
	},
};

function defaultName(interaction) {
    var names = getHolidayNames();
    var userNames = names[interaction.user.id];
    if(!userNames) {
        userNames = {};
    }
    userNames['default'] = interaction.options.getString('name');
    names[interaction.user.id] = userNames;
    setHolidayNames(names);
    interaction.reply({ content: 'Default name has been added/updated', ephemeral: true });
}

function addHolidayName(interaction) {
    var names = getHolidayNames();
    var userNames = names[interaction.user.id];
    if(!userNames) {
        userNames = {};
    }
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday has not been added yet', ephemeral: true });
        return;
    }
    if(userNames) {
        if(userNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
            interaction.reply({ content: 'You already have a nickname for this holiday.  Use the replace command to change', ephemeral: true });
            return;
        }
    }
    userNames[interaction.options.getString('holiday').toLowerCase().trim()] = interaction.options.getString('name');
    names[interaction.user.id] = userNames;
    setHolidayNames(names);
    interaction.reply({ content: 'Holiday name has been added', ephemeral: true });
}

function changeHolidayName(interaction) {
    var names = getHolidayNames();
    var userNames = names[interaction.user.id];
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!userNames) {
        interaction.reply({ content: "You don't have any holiday names", ephemeral: true });
        return;
    }
    if(!userNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
        interaction.reply({ content: "You don't have a nickname for this holiday", ephemeral: true });
        return;
    }
    userNames[interaction.options.getString('holiday').toLowerCase().trim()] = interaction.options.getString('name');
    names[interaction.user.id] = userNames;
    setHolidayNames(names);
    interaction.reply({ content: 'Holiday name has been changed', ephemeral: true });
}

function removeHolidayName(interaction) {
    var names = getHolidayNames();
    var userNames = names[interaction.user.id];
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!userNames) {
        interaction.reply({ content: "You don't have any holiday names", ephemeral: true });
        return;
    }
    if(!userNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
        interaction.reply({ content: "You don't have a nickname for this holiday", ephemeral: true });
        return;
    }
    delete userNames[interaction.options.getString('holiday').toLowerCase().trim()];
    names[interaction.user.id] = userNames;
    setHolidayNames(names);
    interaction.reply({ content: 'Holiday name has been removed', ephemeral: true });
}

function printNames(interaction) {
    var holidays = sortedHolidays();
    var names = getHolidayNames();
    var output = '';
    if(!names[interaction.user.id]) {
        interaction.reply({ content: "You don't have any holiday names", ephemeral: true });
        return;
    }
    holidays.forEach(holiday => {
        if(names[interaction.user.id][holiday]) {
            output += holiday['name'] + ' - ' + names[interaction.user.id][holiday] + '\n';
        } else {
            output += holiday['name'] + ' - ' + 'No name set' + '\n';
        }
    });
    output += 'Default' + ' - ' + names[interaction.user.id]['default'];
    interaction.reply({ content: output.trim(), ephemeral: true });
}