const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const { setBotRef } = require('../../modules/holidayChanger/updaters');
const { setServerId } = require('./icons');

var bot;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-name-help')
		.setDescription('Displays holiday name changer commands and how to use them'),
	async execute(client, interaction) {
		let embed = new EmbedBuilder();
        embed.setColor(3447003).setTitle('List of commands').addFields(
            [{ name: 'holiday-range add', value: 'Add a holiday' },
            { name: 'holiday-range edit', value: 'Edit a holidays date range' },
            { name: 'holiday-range remove', value: 'Remove a holiday' },
            { name: 'holiday-range print', value: 'Displays the holidays and their date ranges' },
            { name: 'holiday-range calendar', value: 'Displays the holidays in a calendar format' },
            { name: 'holiday-name add', value: 'Add/replace a holiday nickname' },
            { name: 'holiday-name remove', value: 'Remove a nickname for a holiday' },
            { name: 'holiday-name print', value: 'Display your holiday nicknames' },
            { name: 'holiday-role default', value: 'Add/replace a default role name' },
            { name: 'holiday-role add', value: 'Add/replace a holiday role name' },
            { name: 'holiday-role remove', value: 'Remove a role name for a holiday' },
            { name: 'holiday-role print', value: 'Display the holiday role names' },
            { name: 'holiday-channel default', value: 'Add/replace a default channel name' },
            { name: 'holiday-channel add', value: 'Add/replace a holiday channel name' },
            { name: 'holiday-channel remove', value: 'Remove a channel name for a holiday' },
            { name: 'holiday-channel print', value: 'Display the holiday channel names' },
            { name: 'holiday-icon default', value: 'Add a default server icon' },
            { name: 'holiday-server-icon add', value: 'Add/replace a holiday server icon' },
            { name: 'holiday-server-icon remove', value: 'Remove a server icon for a holiday' },
            { name: 'holiday-server-icon print', value: 'Display the holiday server icons' }]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

module.exports.startup = (client) => {
    bot = client;
    setServerId(bot.guilds.cache.at(0).id);
    setBotRef(bot);
}

/*
Sorts the given channels by position in the server
*/
module.exports.sortChannels = (channels) => { 
    var guild = bot.guilds.cache.at(0);
    return Object.keys(channels).sort(function (a, b) { return guild.channels.cache.find(val => val.id === b).position - guild.channels.cache.find(val => val.id === a).position});
}

/*
Sorts the given roles by position in the server
*/
module.exports.sortRoles = (roles) => {
    var guild = bot.cache.at(0);
    return Object.keys(roles).sort(function (a, b) { return guild.roles.cache.find(val => val.id === b).position - guild.roles.cache.find(val => val.id === a).position});
}

module.exports.printNames = (names) => {
    var holidays = sortedHolidays();
    var output = '';
    holidays.forEach(holiday => {
        if(names[holiday['name'].toLowerCase().trim()]) {
            if(typeof names[holiday['name'].toLowerCase().trim()] === 'string') {
                output += holiday['name'] + ' - ' + names[holiday['name'].toLowerCase().trim()] + '\n';
            } else {
                output += holiday['name'] + ' - ' + names[holiday['name'].toLowerCase().trim()].name + ' - ' + names[holiday['name'].toLowerCase().trim()].color + '\n';
            }
        } else {
            output += holiday['name'] + ' - ' + 'No name set' + '\n';
        }
    });
    if(names['default']) {
        if(typeof names['default'] === 'string') {
            output += 'Default' + ' - ' + names['default'];
        } else {
            output += 'Default' + ' - ' + names['default'].name + ' - ' + names['default'].color;
        }
    } else {
        output += 'Default' + ' - ' + 'No name set';
    }
    return output;
}