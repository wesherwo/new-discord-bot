const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const holidaysPath = 'saveData/holidays.json';
const holidayNamesPath = 'saveData/holidayNames.json';
const holidayRolesPath = 'saveData/holidayRoles.json';
var bot;
var currentHoliday;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-name-help')
		.setDescription('Displays holiday name changer commands and how to use them'),
	async execute(client, interaction) {
		let embed = new MessageEmbed();
        embed.setColor(3447003).setTitle('List of commands').addFields(
            [{ name: 'holiday-range add', value: 'Add a holiday' },
            { name: 'holiday-range edit', value: 'Edit a holidays date range' },
            { name: 'holiday-range remove', value: 'Remove a holiday' },
            { name: 'holiday-range print', value: 'Displays the holidays and their date ranges' },
            { name: 'holiday-name default', value: 'Add a default nickname' },
            { name: 'holiday-name add', value: 'Add a holiday nickname' },
            { name: 'holiday-name replace', value: 'Replace a nickname for a holiday' },
            { name: 'holiday-name remove', value: 'Remove a nickname for a holiday' },
            { name: 'holiday-name print', value: 'Display you holiday nicknames' }]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

module.exports.startup = (client) => {
    bot = client;
    setTimeout(runEachHour, 6000);
}

function runEachHour() {
    var withinHoliday = isHoliday();
    if(withinHoliday != currentHoliday) {
        currentHoliday = withinHoliday;
        updateHolidayNames(withinHoliday);
    }
    setTimeout(runEachHour, 360000);
}

function isHoliday() {
    var withinHoliday = 'default';
    var date = new Date();
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    Object.keys(holidays).forEach(holiday => {
        var compareStartDate = new Date();
        compareStartDate.setMonth(holidays[holiday]['start-month'] - 1);
        compareStartDate.setDate(holidays[holiday]['start-day']);

        var compareEndDate = new Date();
        compareEndDate.setMonth(holidays[holiday]['end-month'] - 1);
        compareEndDate.setDate(holidays[holiday]['end-day']);
        if((date.getTime() - compareStartDate.getTime() >= 0) && (date.getTime() - compareEndDate.getTime() <= 0)) {
            withinHoliday = holiday;
        }
    });
    return withinHoliday;
}

function updateHolidayNames(withinHoliday) {
    var holidayNames = JSON.parse(fs.readFileSync(holidayNamesPath));
    Object.keys(holidayNames).forEach(userID => {
        var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == userID);
        if(holidayNames[userID][withinHoliday]) {
            user.setNickname(holidayNames[userID][withinHoliday], 'Updated username for ' + withinHoliday);
        } else if(holidayNames[userID]['default']) {
            user.setNickname(holidayNames[userID]['default'], 'Updated username back to default');
        } else {
            user.setNickname(null, 'Removed nickname for ' + withinHoliday);
        }
    });
}

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

module.exports.holidayExists = (holiday) => {
    var exists = false;
    var holidays = JSON.parse(fs.readFileSync(holidaysPath));
    Object.keys(holidays).forEach(holidayName => {
        if(holidayName.toLowerCase().localeCompare(holiday.toLowerCase().trim()) == 0) {
            exists = true;
        }
    });
    return exists;
}

module.exports.sortedHolidays = () => {
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