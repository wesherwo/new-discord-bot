const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const holidaysPath = 'saveData/holidays.json';
const holidayNamesPath = 'saveData/holidayNames.json';
const holidayRolesPath = 'saveData/holidayRoles.json';
const holidayChannelsPath = 'saveData/holidayChannels.json';
const holidayIconsPath = 'saveData/holidayIcons.json';
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
            { name: 'holiday-name default', value: 'Add/replace a default nickname' },
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
        compareStartDate.setDate(1);
        compareStartDate.setMonth(holidays[holiday]['start-month'] - 1);
        compareStartDate.setDate(holidays[holiday]['start-day']);

        var compareEndDate = new Date();
        compareEndDate.setHours(23);
        compareEndDate.setMinutes(59);
        compareEndDate.setDate(1);
        compareEndDate.setMonth(holidays[holiday]['end-month'] - 1);
        compareEndDate.setDate(holidays[holiday]['end-day']);

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
    return withinHoliday;
}

function updateNames() {
    updateHolidayNames();
    updateHolidayRoles();
    updateHolidayChannels();
    updateHolidayIcon();
}

function updateHolidayNames() {
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    var holidayNames = JSON.parse(fs.readFileSync(holidayNamesPath));
    Object.keys(holidayNames).forEach(id => {
        var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == id);
        if(user.id == bot.guilds.cache.at(0).ownerId) {
            if(currentHoliday.localeCompare("default") == 0 && user.nickname.localeCompare(holidayNames[id][currentHoliday]) != 0) {
                user.send('Update your name back to ' + holidayNames[id]['default'] + ' since the holiday is over');
            }
            else if(holidayNames[id][currentHoliday] && user.nickname.localeCompare(holidayNames[id][currentHoliday]) != 0) {
                user.send('Update your name for ' + holidays[currentHoliday]['name'] + ' to ' + holidayNames[id][currentHoliday]);
            } else if(!holidayNames[id][currentHoliday] && user.nickname.localeCompare(holidayNames[id]['default'])) {
                user.send('Update your name back to ' + holidayNames[id]['default'] + ' since you havent come up with a name yet for ' + holidays[currentHoliday]['name']);
            }
        } else {
            if(holidayNames[id][currentHoliday]) {
                user.setNickname(holidayNames[id][currentHoliday], 'Updated username for ' + currentHoliday);
            } else if(holidayNames[id]['default']) {
                user.setNickname(holidayNames[id]['default'], 'Updated username back to default');
            } else {
                user.setNickname(null, 'Removed nickname for ' + currentHoliday);
            }
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

function updateHolidayIcon() {
    var icons = JSON.parse(fs.readFileSync(holidayIconsPath));
    var serverId = bot.guilds.cache.at(0).id;
    if(!icons[serverId]) {
        return;
    }
    else if(icons[serverId][currentHoliday]) {
        bot.guilds.cache.at(0).setIcon(icons[serverId][currentHoliday], 'Updated icon for ' + currentHoliday);
    } else if(icons[serverId]['default']) {
        bot.guilds.cache.at(0).setIcon(icons[serverId]['default'], 'Updated icon back to default');
    }
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

module.exports.getSortedHolidays = () => { return sortedHolidays(); }

module.exports.getHolidays = () => { return JSON.parse(fs.readFileSync(holidaysPath));}
module.exports.setHolidays = (holidays) => { 
    var jsonData = JSON.stringify(holidays);
    fs.writeFileSync(holidaysPath, jsonData, function (err) { if (err) { console.log(err); } });
}

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
module.exports.setHolidayChannels = (channels) => { 
    var jsonData = JSON.stringify(channels);
    fs.writeFileSync(holidayChannelsPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getHolidayIcons = () => { return JSON.parse(fs.readFileSync(holidayIconsPath));}
module.exports.setHolidayIcons = (icons) => { 
    var jsonData = JSON.stringify(icons);
    fs.writeFileSync(holidayIconsPath, jsonData, function (err) { if (err) { console.log(err); } });
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
    if(color === undefined) { idNames[holiday] = name; }
    else { idNames[holiday] = {'name':name, 'color':color}; }
    names[id] = idNames;
    interaction.reply({ content: 'Holiday name has been added', ephemeral: true });
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

module.exports.setDefaultIcon = (icons, icon, interaction) => {
    var serverId = bot.guilds.cache.at(0).id;
    if(!icons[serverId]) {
        icons[serverId] = {};
    }
    icons[serverId]['default'] = icon;
    interaction.reply({ content: 'Default icon has been added/updated', ephemeral: true });
    return icons;
}

module.exports.addIcon = (icons, icon, holiday, interaction) => {
    var serverId = bot.guilds.cache.at(0).id;
    if(!icons[serverId]) {
        icons[serverId] = {};
    }
    if(!holidayExists(holiday)) {
        interaction.reply({ content: 'That holiday has not been added yet', ephemeral: true });
        return;
    }
    icons[serverId][holiday] = icon;
    interaction.reply({ content: 'Holiday icon has been added', ephemeral: true });
    return icons;
}

module.exports.removeIcon = (icons, holiday, interaction) => {
    var serverId = bot.guilds.cache.at(0).id;
    if(!holidayExists(holiday)) {
        interaction.reply({ content: 'That holiday has not been added yet', ephemeral: true });
        return;
    }
    if(!icons[holiday]) {
        interaction.reply({ content: "No icons for any holiday", ephemeral: true });
        return;
    }
    if(!icons[serverId][holiday]) {
        interaction.reply({ content: 'No icon for this holiday.  Use the add command instead', ephemeral: true });
        return;
    }
    delete icons[serverId][holiday];
    interaction.reply({ content: 'Holiday icon has been updated', ephemeral: true });
    return icons;
}

module.exports.printIcons = (interaction) => {
    var icons = JSON.parse(fs.readFileSync(holidayIconsPath));
    var serverId = bot.guilds.cache.at(0).id;
    var holidays = sortedHolidays();
    var output = '';
    holidays.forEach(holiday => {
        if(icons[serverId][holiday['name'].toLowerCase().trim()]) {
            output += holiday['name'] + ' - ' + icons[serverId][holiday['name'].toLowerCase().trim()] + '\n';
        } else {
            output += holiday['name'] + ' - ' + 'No icon set' + '\n';
        }
    });
    if(icons[serverId]['default']) {
        output += 'Default' + ' - ' + icons[serverId]['default'];
    } else {
        output += 'Default' + ' - ' + 'No icon set';
    }
    interaction.reply({ content: output.trim(), ephemeral: true });
}

module.exports.updateForNameChange = (holiday, id) => {
    var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == id);
    if(holiday.localeCompare(currentHoliday) == 0 && id != bot.guilds.cache.at(0).ownerId) {
        if(JSON.parse(fs.readFileSync(holidayNamesPath))[id][currentHoliday]) {
            user.setNickname(JSON.parse(fs.readFileSync(holidayNamesPath))[id][currentHoliday], 'Updated username for ' + currentHoliday);
        } else if(JSON.parse(fs.readFileSync(holidayNamesPath))[id]['default']) {
            user.setNickname(JSON.parse(fs.readFileSync(holidayNamesPath))[id]['default'], 'Updated username for ' + currentHoliday);
        } else {
            user.setNickname(null, 'Removed holiday name for ' + currentHoliday);
        }
    } else if(holiday.localeCompare('default') == 0) {
        user.setNickname(JSON.parse(fs.readFileSync(holidayNamesPath))[id]['default'], 'Updated username for ' + currentHoliday);
    }
}

module.exports.updateForChannelChange = (holiday, id) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        var holidayNames = JSON.parse(fs.readFileSync(holidayChannelsPath));
        var channel = bot.guilds.cache.at(0).channels.cache.find(channel => channel.id == id);
        if(holidayNames[id][currentHoliday]) {
            channel.setName(holidayNames[id][currentHoliday], 'Updated channel for ' + currentHoliday);
        } else if(holidayNames[id]['default']) {
            channel.setName(holidayNames[id]['default'], 'Updated channel back to default');
        }
    }
}

module.exports.updateForRoleChange = (holiday, id) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        var holidayNames = JSON.parse(fs.readFileSync(holidayRolesPath));
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
    }
}

module.exports.updateForIconChange = (holiday) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        var serverId = bot.guilds.cache.at(0).id;
        if(JSON.parse(fs.readFileSync(holidayIconsPath))[serverId][currentHoliday]) {
            bot.guilds.cache.at(0).setIcon(JSON.parse(fs.readFileSync(holidayIconsPath))[serverId][currentHoliday], 'Updated username for ' + currentHoliday);
        } else if(JSON.parse(fs.readFileSync(holidayIconsPath))[serverId]["default"]) {
            bot.guilds.cache.at(0).setIcon(JSON.parse(fs.readFileSync(holidayIconsPath))[serverId]["default"], 'Updated username for ' + currentHoliday);
        }
    }
}