const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const holidaysPath = 'saveData/holidays.json';
const holidayNamesPath = 'saveData/holidayNames.json';
const holidayRolesPath = 'saveData/holidayRoles.json';
const holidayChannelsPath = 'saveData/holidayChannels.json';
var bot;
var currentHoliday;

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
            { name: 'holiday-name default', value: 'Add a default nickname' },
            { name: 'holiday-name add', value: 'Add a holiday nickname' },
            { name: 'holiday-name replace', value: 'Replace a nickname for a holiday' },
            { name: 'holiday-name remove', value: 'Remove a nickname for a holiday' },
            { name: 'holiday-name print', value: 'Display your holiday nicknames' },
            { name: 'holiday-role default', value: 'Add a default role name' },
            { name: 'holiday-role add', value: 'Add a holiday role name' },
            { name: 'holiday-role replace', value: 'Replace a role name for a holiday' },
            { name: 'holiday-role remove', value: 'Remove a role name for a holiday' },
            { name: 'holiday-role print', value: 'Display the holiday role names' },
            { name: 'holiday-channel default', value: 'Add a default channel name' },
            { name: 'holiday-channel add', value: 'Add a holiday channel name' },
            { name: 'holiday-channel replace', value: 'Replace a channel name for a holiday' },
            { name: 'holiday-channel remove', value: 'Remove a channel name for a holiday' },
            { name: 'holiday-channel print', value: 'Display the holiday channel names' }]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

module.exports.startup = (client) => {
    bot = client;
    setTimeout(runEachHour, 5000);
}

function runEachHour() {
    var withinHoliday = isHoliday();
    if(withinHoliday.localeCompare(currentHoliday) != 0) {
        currentHoliday = withinHoliday;
        updateNames();
    }
    setTimeout(runEachHour, 3600000);
}

function isHoliday() {
    var withinHoliday = 'default';
    var date = new Date();
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    Object.keys(holidays).forEach(holiday => {
        var compareStartDate = new Date();
        compareStartDate.setHours(0);
        compareStartDate.setMinutes(1);
        compareStartDate.setDate(holidays[holiday]['start-day']);
        compareStartDate.setMonth(holidays[holiday]['start-month'] - 1);

        var compareEndDate = new Date();
        compareEndDate.setHours(23);
        compareEndDate.setMinutes(59);
        compareEndDate.setDate(holidays[holiday]['end-day']);
        compareEndDate.setMonth(holidays[holiday]['end-month'] - 1);

        if(compareStartDate.getTime() - compareEndDate.getTime() > 0) {
            if(date.getTime() - compareStartDate.getTime() >= 0) {
                compareEndDate.setFullYear(compareEndDate.getFullYear() + 1);
            } else {
                compareStartDate.setFullYear(compareStartDate.getFullYear() - 1);
            }
        }
        if((date.getTime() - compareStartDate.getTime() >= 0) && (date.getTime() - compareEndDate.getTime() <= 0)) {
            withinHoliday = holiday;
        }
    });

    if(date.getDate() == 31) {
        console.log('line 92: withinHoliday = ' + withinHoliday);
    }

    return withinHoliday;
}

function updateNames() {

    var date = new Date();
    if(date.getDate() == 31) {
        console.log('line 102: currentHoliday = ' + currentHoliday);
        console.log();
        console.log('====================================================');
        console.log();
    }

    updateHolidayNames();
    updateHolidayRoles();
    updateHolidayChannels();
}

function updateHolidayNames() {
    var holidayNames = JSON.parse(fs.readFileSync(holidayNamesPath));
    Object.keys(holidayNames).forEach(id => {
        var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == id);
        if(holidayNames[id][currentHoliday]) {
            user.setNickname(holidayNames[id][currentHoliday], 'Updated username for ' + currentHoliday);
        } else if(holidayNames[id]['default']) {
            user.setNickname(holidayNames[id]['default'], 'Updated username back to default');
        } else {
            user.setNickname(null, 'Removed nickname for ' + currentHoliday);
        }
    });
}

function updateHolidayRoles() {
    var holidayNames = JSON.parse(fs.readFileSync(holidayRolesPath));
    Object.keys(holidayNames).forEach(id => {
        var role = bot.guilds.cache.at(0).roles.cache.find(role => role.id == id);
        if(holidayNames[id][currentHoliday]) {
            if(typeof holidayNames[id][currentHoliday] === 'string') {
                role.setName(holidayNames[id][currentHoliday], 'Updated role for ' + currentHoliday);
            } else {
                role.setName(holidayNames[id][currentHoliday].name, 'Updated role for ' + currentHoliday);
                role.setColor(holidayNames[id][currentHoliday].color, 'Updated role for ' + currentHoliday);
            }
        } else if(holidayNames[id]['default']) {
            if(typeof holidayNames[id]['default'] === 'string') {
                role.setName(holidayNames[id]['default'], 'Updated role back to default');
            } else {
                role.setName(holidayNames[id]['default'].name, 'Updated role back to default');
                role.setColor(holidayNames[id]['default'].color, 'Updated role for ' + currentHoliday);
            }
        }
    });
}

function updateHolidayChannels() {
    var holidayNames = JSON.parse(fs.readFileSync(holidayChannelsPath));
    Object.keys(holidayNames).forEach(id => {
        var channel = bot.guilds.cache.at(0).channels.cache.find(channel => channel.id == id);
        if(holidayNames[id][currentHoliday]) {
            channel.setName(holidayNames[id][currentHoliday], 'Updated channel for ' + currentHoliday);
        } else if(holidayNames[id]['default']) {
            channel.setName(holidayNames[id]['default'], 'Updated channel back to default');
        }
    });
}

function holidayExists(holiday) {
    var exists = false;
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    Object.keys(holidays).forEach(holidayName => {
        if(holidayName.toLowerCase().localeCompare(holiday.toLowerCase().trim()) == 0) {
            exists = true;
        }
    });
    return exists;
}

function sortedHolidays() {
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    var sortedHolidays = [];
    Object.keys(holidays).forEach(holiday => {
        sortedHolidays.push(holidays[holiday]);
    });
    //sorts on month 1st since the day can only return up to 30 make the month difference at least 31
    //same month will be 0 and different will be 1 or more * 69
    sortedHolidays.sort(function (a, b) { return ((a['start-month'] - b['start-month']) * 69) + a['start-day'] - b['start-day']});
    return sortedHolidays;
}

module.exports.getHolidays = () => { return JSON.parse(fs.readFileSync(holidaysPath));}
module.exports.setHolidays = (holidays) => { 
    var jsonData = JSON.stringify(holidays);
    fs.writeFileSync(holidaysPath, jsonData, function (err) { if (err) { console.log(err); } });
}
module.exports.getSortedHolidays = () => { return sortedHolidays();}

module.exports.getHolidayNames = () => { return JSON.parse(fs.readFileSync(holidayNamesPath));}
module.exports.setHolidayNames = (names) => { 
    var jsonData = JSON.stringify(names);
    fs.writeFileSync(holidayNamesPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getHolidayRoles = () => { return JSON.parse(fs.readFileSync(holidayRolesPath));}
module.exports.setHolidayRoles = (roles) => { 
    var jsonData = JSON.stringify(roles);
    fs.writeFileSync(holidayRolesPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getHolidayChannels = () => { return JSON.parse(fs.readFileSync(holidayChannelsPath));}
module.exports.setHolidayChannels = (Channels) => { 
    var jsonData = JSON.stringify(Channels);
    fs.writeFileSync(holidayChannelsPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.setDefaultName = (names, id, name, interaction, color) =>{
    var idNames = names[id];
    if(!idNames) {
        idNames = {};
    }
    if(color === undefined) { idNames['default'] = name; }
    else { idNames['default'] = {'name':name, 'color':color}; }
    names[id] = idNames;
    interaction.reply({ content: 'Default name has been added/updated', ephemeral: true });
    return names;
}

module.exports.addName = (names, id, holiday, name, interaction, color) => {
    var idNames = names[id];
    if(!idNames) {
        idNames = {};
    }
    if(!holidayExists(holiday)) {
        interaction.reply({ content: 'That holiday has not been added yet', ephemeral: true });
        return;
    }
    if(idNames) {
        if(idNames[holiday]) {
            interaction.reply({ content: 'There is already a name for this holiday.  Use the replace command to change', ephemeral: true });
            return;
        }
    }
    if(color === undefined) { idNames[holiday] = name; }
    else { idNames[holiday] = {'name':name, 'color':color}; }
    names[id] = idNames;
    interaction.reply({ content: 'Holiday name has been added', ephemeral: true });
    return names;
}

module.exports.changeName = (names, id, holiday, name, interaction, color) => {
    var idNames = names[id];
    if(!holidayExists(holiday)) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!idNames) {
        interaction.reply({ content: "No names for any holiday", ephemeral: true });
        return;
    }
    if(!idNames[interaction.options.getString('holiday').toLowerCase().trim()]) {
        interaction.reply({ content: "No name for this holiday.  Use the add command instead", ephemeral: true });
        return;
    }
    if(color === undefined) { idNames[holiday] = name; }
    else { idNames[holiday] = {'name':name, 'color':color}; }
    names[id] = idNames;
    interaction.reply({ content: 'Holiday name has been changed', ephemeral: true });
    return names;
}

module.exports.removeName = (names, id, holiday, interaction) => {
    var idNames = names[id];
    if(!holidayExists(holiday)) {
        interaction.reply({ content: 'That holiday does not exist', ephemeral: true });
        return;
    }
    if(!idNames) {
        interaction.reply({ content: "No names for any holiday", ephemeral: true });
        return;
    }
    if(!idNames[holiday]) {
        interaction.reply({ content: "No names for this holiday", ephemeral: true });
        return;
    }
    delete idNames[holiday];
    names[id] = idNames;
    interaction.reply({ content: 'Holiday name has been removed', ephemeral: true });
    return names;
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