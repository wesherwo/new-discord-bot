const { SlashCommandBuilder } = require('@discordjs/builders');
const { getIcons, setIcons } = require('../../modules/holidayChanger/saveData');
const { sortHolidays } = require('../../modules/holidayChanger/holidays');
const { holidaySelection, nameModal, printHolidays } = require('../../modules/holidayChanger/messageComponents');
const { updateForIconChange } = require('../../modules/holidayChanger/updaters');

var serverId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-server-icon')
		.setDescription('Edit holiday icon for the server')
        .addSubcommand(subcommand =>
            subcommand.setName('default')
                .setDescription('Sets a default icon when it is not a holiday')
                .addStringOption(option => option.setName('icon').setDescription('Servers default icon').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('update')
                .setDescription('Updates a icon for a holiday'))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a icon for a holiday'))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays holiday icons')),
        
    async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'default') {
            defaultIcon(interaction);
        } else if (interaction.options.getSubcommand() == 'update') {
            updateIcon(interaction);
        } else if (interaction.options.getSubcommand() == 'remove') {
            removeIcon(interaction);
        } else if (interaction.options.getSubcommand() == 'print') {
            printIcons(interaction);
        }
    },
};

module.exports.setServerId = (id) => {
    serverId = id;
}

/*
Updates a channels default name
*/
function defaultIcon(interaction) {
    //All icons
    var icons = getIcons();

    //Specific server icons
    var serverIcons = icons[serverId];

    //If server has no icons set icons so one can be added
    if(!serverIcons) { serverIcons = {}; }

    serverIcons['default'] = interaction.options.getString('icon');
    icons[serverId] = serverIcons;
    setIcons(icons);
    updateForIconChange('default', serverId);
    interaction.reply({content: `Default icon has been updated to ${interaction.options.getString('icon')}`, ephemeral: true });
}

/*
Updates a channel name for a given holiday
*/
function updateIcon(interaction) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All icons
    var icons = getIcons();

    //Specific server icons
    var serverIcons = icons[serverId];

    //If server has no icons set icons so one can be added
    if(!serverIcons) { serverIcons = {}; }
    
    var actionText = 'update the icon for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, serverIcons).then((holidayResponse) => {
        nameModal(holidayResponse[1]).then(nameResponse => {
            serverIcons[holidayResponse[0]] = nameResponse[0];
            icons[serverId] = serverIcons;
            setIcons(icons);
            updateForIconChange(holidayResponse[0], serverId);
            nameResponse[1].reply({content: `Icons has been updated to ${nameResponse[0]} for ${holidayResponse[0]}`, ephemeral: true });
        });
    });
}

/*
Removes selected channel name
*/
function removeIcon(interaction) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All icons
    var icons = getIcons();

    //Specific server icons
    var serverIcons = icons[serverId];

    //If server has no icons set icons so one can be added
    if(!serverIcons) { serverIcons = {}; }
    
    var actionText = 'remove the icon for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, serverIcons).then((holidayResponse) => {
        delete serverIcons[holidayResponse[0]];
        icons[serverId] = serverIcons;
        setIcons(icons);
        updateForIconChange(holidayResponse[0], serverId);
        holidayResponse[1].reply({content: `Icon has been removed for ${holidayResponse[0]}`, ephemeral: true });
    });
}

/*
Prints a channels holiday names
*/
function printIcons(interaction) {
    var icons = getIcons();
    if(!icons[serverId]) {
        interaction.reply({ content: 'Server has no holiday names', ephemeral: true });
        return;
    }
    printHolidays(interaction, serverId, icons[serverId]);
}