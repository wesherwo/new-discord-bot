const { getHolidays, getNames, getRoles, getChannels, getIcons } = require('./saveData');
const { getHolidayOnDate } = require('../../modules/holidayChanger/holidays');
const iconPath = 'resources/serverIcons/';

var bot;
var currentHoliday;

module.exports.setBotRef = (client) => {
    bot = client;
    setTimeout(runEachHour, 5000);
}

function runEachHour() {
    // Get todays holiday
    var date = new Date();
    var withinHoliday = getHolidayOnDate(date.getMonth() + 1, date.getDate());
    // This is always true on startup
    if(withinHoliday.localeCompare(currentHoliday) != 0) {
        currentHoliday = withinHoliday;
        updateNames();
    }
    setTimeout(runEachHour, 3600000);
}

function updateNames() {
    updateNicknames();
    updateRoles();
    updateChannels();
    updateIcon();
}

function updateNicknames() {
    var holidayNames = getNames();
    Object.keys(holidayNames).forEach(id => {
        updateNickname(id);
    });
}

function updateNickname(id) {
    var holidays = getHolidays();
    var holidayNames = getNames();
    var user = bot.guilds.cache.at(0).members.cache.find(user => user.id == id);
    // If user is the server owner the nickname cannot be updated
    // Instead send them a message
    if(user.id == bot.guilds.cache.at(0).ownerId) {
        var nickname;
        if(user.nickname) { nickname = user.nickname; }
        else { nickname = user.user.username }
        if(currentHoliday.localeCompare('default') == 0 && holidayNames[id]['default'] && nickname.localeCompare(holidayNames[id]['default']) != 0) {
            user.send('Update your name back to ' + holidayNames[id]['default'] + ' since you havent come up with a name yet for ' + holidays[currentHoliday]['name']);
        }else if(holidayNames[id][currentHoliday] && nickname.localeCompare(holidayNames[id][currentHoliday]) != 0) {
            user.send('Update your name for ' + holidays[currentHoliday]['name'] + ' to ' + holidayNames[id][currentHoliday]);
        }
    // Any user thats not the server owner
    } else {
        if(holidayNames[id][currentHoliday]) {
            user.setNickname(holidayNames[id][currentHoliday], 'Updated username for ' + currentHoliday);
        } else if(holidayNames[id]['default']) {
            user.setNickname(holidayNames[id]['default'], 'Updated username back to default');
        } else {
            user.setNickname(null, 'Removed nickname for ' + currentHoliday);
        }
    }
}

function updateChannels() {
    var channels = getChannels();
    Object.keys(channels).forEach(id => {
        updateChannel(id);
    });
}

function updateChannel(id) {
    var channels = getChannels();
    var channel = bot.guilds.cache.at(0).channels.cache.find(channel => channel.id == id);
    if(channels[id][currentHoliday]) {
        channel.setName(channels[id][currentHoliday], 'Updated channel for ' + currentHoliday);
    } else if(channels[id]['default']) {
        channel.setName(channels[id]['default'], 'Updated channel back to default');
    }
}

function updateRoles() {
    var roles = getRoles();
    Object.keys(roles).forEach(id => {
        updateRole(id);
    });
}

function updateRole(id) {
    var roles = getRoles();
    var role = bot.guilds.cache.at(0).roles.cache.find(role => role.id == id);
    if(roles[id][currentHoliday]) {
        role.setName(roles[id][currentHoliday].name, 'Updated role for ' + currentHoliday);
        role.setColor(roles[id][currentHoliday].color, 'Updated role for ' + currentHoliday);
    } else if(roles[id]['default']) {
        role.setName(roles[id]['default'].name, 'Updated role back to default');
        role.setColor(roles[id]['default'].color, 'Updated role for ' + currentHoliday);
    }
}

function updateIcon() {
    var icons = getIcons();
    var serverId = bot.guilds.cache.at(0).id;
    if(!icons[serverId]) {
        return;
    }
    else if(icons[serverId][currentHoliday]) {
        bot.guilds.cache.at(0).setIcon(iconPath + icons[serverId][currentHoliday] + '.png', 'Updated icon for ' + currentHoliday);
    } else if(icons[serverId]['default']) {
        bot.guilds.cache.at(0).setIcon(iconPath + icons[serverId]['default'] + '.png', 'Updated icon back to default');
    }
}

module.exports.updateForNameChange = (holiday, id) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        updateNickname(id);
    }
}

module.exports.updateForChannelChange = (holiday, id) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        updateChannel(id);
    }
}

module.exports.updateForRoleChange = (holiday, id) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        updateRole(id);
    }
}

module.exports.updateForIconChange = (holiday) => {
    if(holiday.localeCompare(currentHoliday) == 0) {
        updateIcon();
    }
}

module.exports.getCurrentHoliday = () => { return currentHoliday; }