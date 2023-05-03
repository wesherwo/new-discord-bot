const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidayRoles, setHolidayRoles, setDefaultName, addName, changeName, removeName, printNames } = require('./_holidayNameChanger');
var bot;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-role')
		.setDescription('Edit holiday names for a role')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default nickname when it is not a holiday')
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles name for when its not a holiday').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles name for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('replace')
                .setDescription('Replaces a nickname for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Role for the new name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles new name for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a nickname for a holiday')
                .addRoleOption(option => option.setName('role').setDescription('Role to remove name').setRequired(true))
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday role names')),
        
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
			printHolidayRoles(interaction);
		}
	},
};

module.exports.startup = (client) => {
    bot = client;
}

function defaultName(interaction) {
    var roles = setDefaultName(getHolidayRoles(), interaction.options.getRole('role').id, interaction.options.getString('name'), interaction);
    setHolidayRoles(roles);
}

function addHolidayName(interaction) {
    var names = addName(getHolidayRoles(), interaction.options.getRole('role').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getString('name'), interaction);
    setHolidayRoles(names);
}

function changeHolidayName(interaction) {
    var names = changeName(getHolidayRoles(), interaction.options.getRole('role').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getString('name'), interaction);
    setHolidayRoles(names);
}

function removeHolidayName(interaction) {
    var names = removeName(getHolidayRoles(), interaction.options.getRole('role').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction);
    setHolidayRoles(names);
}

function printHolidayRoles(interaction) {
    var roles = getHolidayRoles();
    var guild = bot.guilds.cache.at(0);
    var sortedIDs = Object.keys(roles).sort(function (a, b) { return guild.roles.cache.find(val => val.id === b).position - guild.roles.cache.find(val => val.id === a).position});
    var output = '';
    sortedIDs.forEach(id => {
        output += '**' + guild.roles.cache.find(val => val.id === id).name + '**\n' + printNames(roles[id]) + '\n\n';
    });
    interaction.reply({ content: output.trim(), ephemeral: true });
}