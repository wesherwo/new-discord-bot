const fs = require('node:fs');

const holidaysPath = 'saveData/holidayChanger/holidays.json';
const namesPath = 'saveData/holidayChanger/names.json';
const rolesPath = 'saveData/holidayChanger/roles.json';
const channelsPath = 'saveData/holidayChanger/channels.json';
const iconsPath = 'saveData/holidayChanger/icons.json';
const imagesPath = 'resources/serverIcons/';

module.exports.getHolidays = () => { return JSON.parse(fs.readFileSync(holidaysPath));}
module.exports.setHolidays = (holidays) => { 
    var jsonData = JSON.stringify(holidays);
    fs.writeFileSync(holidaysPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getNames = () => { return JSON.parse(fs.readFileSync(namesPath));}
module.exports.setNames = (names) => { 
    var jsonData = JSON.stringify(names);
    fs.writeFileSync(namesPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getRoles = () => { return JSON.parse(fs.readFileSync(rolesPath));}
module.exports.setRoles = (roles) => { 
    var jsonData = JSON.stringify(roles);
    fs.writeFileSync(rolesPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getChannels = () => { return JSON.parse(fs.readFileSync(channelsPath));}
module.exports.setChannels = (channels) => { 
    var jsonData = JSON.stringify(channels);
    fs.writeFileSync(channelsPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.getIcons = () => { return JSON.parse(fs.readFileSync(iconsPath));}
module.exports.setIcons = (icons) => { 
    var jsonData = JSON.stringify(icons);
    fs.writeFileSync(iconsPath, jsonData, function (err) { if (err) { console.log(err); } });
}
module.exports.getImagesPath = () => { return imagesPath }