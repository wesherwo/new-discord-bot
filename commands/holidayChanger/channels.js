const { SlashCommandBuilder } = require('@discordjs/builders');
const { getChannels, setChannels } = require('../../modules/holidayChanger/saveData');
const { sortHolidays } = require('../../modules/holidayChanger/holidays');
const { holidaySelection, nameModal, printHolidays } = require('../../modules/holidayChanger/messageComponents');
const { updateForChannelChange } = require('../../modules/holidayChanger/updaters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-channel')
		.setDescription('Edit holiday names for a channel')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default channel name when it is not a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Channels default name').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('update')
				.setDescription('Updates a channel name for a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a channel name for a holiday')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays holiday channel names')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for the name').setRequired(true))),
        
	async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'default') {
			defaultChannel(interaction, interaction.options.getChannel('channel').id);
		} else if (interaction.options.getSubcommand() == 'update') {
			updateChannel(interaction, interaction.options.getChannel('channel').id);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeChannel(interaction, interaction.options.getChannel('channel').id);
		} else if (interaction.options.getSubcommand() == 'print') {
			printChannels(interaction, interaction.options.getChannel('channel').id);
		}
	},
};

/*
Updates a channels default name
*/
function defaultChannel(interaction, channelId) {
    //All channel names
    var names = getChannels();

    //Specific channel names
    var channelNames = names[channelId];

    //If channel has no names set names so one can be added
    if(!channelNames) { channelNames = {}; }

    channelNames['default'] = interaction.options.getString('name');
    names[channelId] = channelNames;
    setChannels(names);
    updateForChannelChange('default', channelId);
    interaction.reply({content: `Default channel name has been updated to ${interaction.options.getString('name')}`, ephemeral: true });
}

/*
Updates a channel name for a given holiday
*/
function updateChannel(interaction, channelId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All channel names
    var names = getChannels();

    //Specific channel names
    var channelNames = names[channelId];

    //If channel has no names set names so one can be added
    if(!channelNames) { channelNames = {}; }
    
    var actionText = 'update the channel name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, channelNames).then((holidayResponse) => {
        nameModal(holidayResponse[1]).then(nameResponse => {
            channelNames[holidayResponse[0]] = nameResponse[0];
            names[channelId] = channelNames;
            setChannels(names);
            updateForChannelChange(holidayResponse[0], channelId);
            nameResponse[1].reply({content: `Channel name has been updated to ${nameResponse[0]} for ${holidayResponse[0]}`, ephemeral: true });
        });
    });
}

/*
Removes selected channel name
*/
function removeChannel(interaction, channelId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All channel names
    var names = getChannels();

    //Specific channel names
    var channelNames = names[channelId];

    //If channel has no names set names so one can be added
    if(!channelNames) { channelNames = {}; }
    
    var actionText = 'remove the channel name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, channelNames).then((holidayResponse) => {
        delete channelNames[holidayResponse[0]];
        names[channelId] = channelNames;
        setChannels(names);
        updateForChannelChange(holidayResponse[0], channelId);
        holidayResponse[1].reply({content: `Channel name has been removed for ${holidayResponse[0]}`, ephemeral: true });
    });
}

/*
Prints a channels holiday names
*/
function printChannels(interaction, channelId) {
    var names = getChannels();
    if(!names[channelId]) {
        interaction.reply({ content: 'Channel has no holiday names', ephemeral: true });
        return;
    }
    printHolidays(interaction, channelId, names[channelId]);
}