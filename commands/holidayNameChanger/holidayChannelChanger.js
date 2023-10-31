const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidayChannels, setHolidayChannels, setDefaultName, addName, changeName, removeName, printNames } = require('./_holidayNameChanger');
var bot;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-channel')
		.setDescription('Edit holiday names for a channel')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default channel name when it is not a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Channels name for when its not a holiday').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new channel name for a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Channels name for the holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a channel name for a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel to remove name').setRequired(true))
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the channel name removal').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday channel names')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'default') {
			defaultName(interaction);
        } else if (interaction.options.getSubcommand() == 'add') {
			addHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHolidayName(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printHolidayChannels(interaction);
		}
	},
};

module.exports.startup = (client) => {
    bot = client;
}

function defaultName(interaction) {
    var channels = setDefaultName(getHolidayChannels(), interaction.options.getChannel('channel').id, interaction.options.getString('name'), interaction);
    setHolidayChannels(channels);
    updateForChannelChange('default', interaction.options.getChannel('channel').id);
}

function addHolidayName(interaction) {
    var names = addName(getHolidayChannels(), interaction.options.getChannel('channel').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getString('name'), interaction);
    setHolidayChannels(names);
    updateForChannelChange(interaction.options.getString('holiday').toLowerCase().trim(), interaction.options.getChannel('channel').id);
}

function removeHolidayName(interaction) {
    var names = removeName(getHolidayChannels(), interaction.options.getChannel('channel').id, interaction.options.getString('holiday').toLowerCase().trim(), interaction);
    setHolidayChannels(names);
    updateForChannelChange('default', interaction.options.getChannel('channel').id);
}

function printHolidayChannels(interaction) {
    var channels = getHolidayChannels();
    var guild = bot.guilds.cache.at(0);
    var sortedIDs = Object.keys(channels).sort(function (a, b) { return guild.channels.cache.find(val => val.id === b).position - guild.channels.cache.find(val => val.id === a).position});
    var output = '';
    sortedIDs.forEach(id => {
        output += '**' + guild.channels.cache.find(val => val.id === id).name + '**\n' + printNames(channels[id]) + '\n\n';
    });
    interaction.reply({ content: output.trim(), ephemeral: true });
}