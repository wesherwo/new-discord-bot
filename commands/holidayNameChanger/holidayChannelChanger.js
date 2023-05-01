const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidayNames, setHolidayNames, getHolidayRoles, setHolidayRoles, holidayExists, sortedHolidays } = require('./_holidayNameChanger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-role')
		.setDescription('Edit holiday names for a role')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default nickname when it is not a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles name for when its not a holiday').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Channels name for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('replace')
                .setDescription('Replaces a nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the new name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles new name for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a nickname for a holiday')
                .addChannelOption(option => option.setName('role').setDescription('Role to remove name').setRequired(true))
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday channel names')),
        
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
    console.log(interaction.options.getRole('role'));
    var roles = getHolidayRoles();
    var roleNames = roles[interaction.options.getRole('role')];
    if(!roleNames) {
        roleNames = {};
    }
    roleNames['default'] = interaction.options.getString('name');
    roles[interaction.options.getRole('role')] = roleNames;
    setHolidayRoles(roles);
    interaction.reply({ content: 'Default name has been added/updated', ephemeral: true });
}

function addHolidayName(interaction) {
    var roles = getHolidayRoles();
    var roleNames = roles[interaction.options.getRole('role')];
    if(!roleNames) {
        roleNames = {};
    }
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday has not been added yet', ephemeral: true });
        return;
    }
    if(roleNames) {
        if(roleNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
            interaction.reply({ content: 'That role already has a name for this holiday.  Use the replace command to change', ephemeral: true });
            return;
        }
    }
    roleNames[interaction.options.getString('holiday').toLowerCase().trim()] = interaction.options.getString('name');
    roles[interaction.options.getRole('role')] = roleNames;
    setHolidayRoles(names);
    interaction.reply({ content: 'Holiday name has been added', ephemeral: true });
}

function changeHolidayName(interaction) {
    var roles = getHolidayRoles();
    var roleNames = roles[interaction.options.getRole('role')];
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!roleNames) {
        interaction.reply({ content: "That role doesn't have any holiday names", ephemeral: true });
        return;
    }
    if(!roleNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
        interaction.reply({ content: "That role doesn't have a name for this holiday", ephemeral: true });
        return;
    }
    roleNames[interaction.options.getString('holiday').toLowerCase().trim()] = interaction.options.getString('name');
    roles[interaction.options.getRole('role')] = roleNames;
    setHolidayRoles(roles);
    interaction.reply({ content: 'Holiday name has been changed', ephemeral: true });
}

function removeHolidayName(interaction) {
    var roles = getHolidayRoles();
    var roleNames = roles[interaction.options.getRole('role')];
    if(!holidayExists(interaction.options.getString('holiday'))) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!roleNames) {
        interaction.reply({ content: "That role doesn't have any holiday names", ephemeral: true });
        return;
    }
    if(!roleNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
        interaction.reply({ content: "That role doesn't have a name for this holiday", ephemeral: true });
        return;
    }
    delete roleNames[interaction.options.getString('holiday').toLowerCase().trim()];
    roles[interaction.options.getRole('role')] = roleNames;
    setHolidayRoles(roles);
    interaction.reply({ content: 'Holiday name has been removed', ephemeral: true });
}

function printNames(interaction) {
    var holidays = sortedHolidays();
    var names = getHolidayRoles();
    var output = '';
    if(!names[interaction.options.getRole('role')]) {
        interaction.reply({ content: "That role doesn't have any holiday names", ephemeral: true });
        return;
    }
    holidays.forEach(holiday => {
        if(names[interaction.options.getRole('role')][holiday['name'].toLowerCase().trim()]) {
            output += holiday['name'] + ' - ' + names[interaction.options.getRole('role')][holiday['name'].toLowerCase().trim()] + '\n';
        } else {
            output += holiday['name'] + ' - ' + 'No name set' + '\n';
        }
    });
    output += 'Default' + ' - ' + names[interaction.options.getRole('role')]['default'];
    interaction.reply({ content: output.trim(), ephemeral: true });
}