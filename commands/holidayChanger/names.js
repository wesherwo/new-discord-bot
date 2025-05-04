const { SlashCommandBuilder } = require('@discordjs/builders');
const { getNames, setNames } = require('../../modules/holidayChanger/saveData');
const { sortHolidays } = require('../../modules/holidayChanger/holidays');
const { holidaySelection, nameModal, printHolidays } = require('../../modules/holidayChanger/messageComponents');
const { updateForNameChange } = require('../../modules/holidayChanger/updaters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-name')
		.setDescription('Edit holiday names for a user')
        .addSubcommand(subcommand =>
			subcommand.setName('default')
				.setDescription('Sets a default nickname when it is not a holiday')
                .addStringOption(option => option.setName('name').setDescription('Users default nickname').setRequired(true)))
        .addSubcommand(subcommand =>
			subcommand.setName('update')
				.setDescription('Updates a nickname for a holiday'))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a nickname for a holiday'))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays your holiday names')),
        
	async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'default') {
			defaultName(interaction, interaction.user.id);
		} else if (interaction.options.getSubcommand() == 'update') {
			updateName(interaction, interaction.user.id);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeName(interaction, interaction.user.id);
		} else if (interaction.options.getSubcommand() == 'print') {
			printNicknames(interaction, interaction.user.id);
		}
	},
};

/*
These methods are used in masterNameChanger
*/
module.exports.defaultName = (interaction, userId) => { defaultName(interaction, userId); }
module.exports.updateName = (interaction, userId) => { updateName(interaction, userId); }
module.exports.removeName = (interaction, userId) => { removeName(interaction, userId); }
module.exports.printNicknames = (interaction, userId) => { printNicknames(interaction, userId); }

/*
Updates a users default nickname
*/
function defaultName(interaction, userId) {
    //All nicknames
    var names = getNames();

    //Specific users nicknames
    var usernames = names[userId];

    //If user has no nicknames set users names so one can be added
    if(!usernames) { usernames = {}; }

    usernames['default'] = interaction.options.getString('name');
    names[userId] = usernames;
    setNames(names);
    updateForNameChange('default', userId);
    interaction.reply({content: `Default name has been updated to ${interaction.options.getString('name')}`, ephemeral: true });
}

/*
Updates a users nickname for a given holiday
*/
function updateName(interaction, userId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All nicknames
    var names = getNames();

    //Specific users nicknames
    var usernames = names[userId];

    //If user has no nicknames set users names so one can be added
    if(!usernames) { usernames = {}; }
    
    var actionText = 'update the name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, usernames).then((holidayResponse) => {
        nameModal(holidayResponse[1]).then(nameResponse => {
            usernames[holidayResponse[0]] = nameResponse[0];
            names[userId] = usernames;
            setNames(names);
            updateForNameChange(holidayResponse[0], userId);
            nameResponse[1].reply({content: `Name has been updated to ${nameResponse[0]} for ${holidayResponse[0]}`, ephemeral: true });
        });
    });
}

/*
Removes selected nickname
*/
function removeName(interaction, userId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All nicknames
    var names = getNames();

    //Specific users nicknames
    var usernames = names[userId];

    //If user has no nicknames set users names so one can be added
    if(!usernames) { usernames = {}; }
    
    var actionText = 'remove the name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, usernames).then((holidayResponse) => {
        delete usernames[holidayResponse[0]];
        names[userId] = usernames;
        setNames(names);
        updateForNameChange(holidayResponse[0], userId);
        holidayResponse[1].reply({content: `Name has been removed for ${holidayResponse[0]}`, ephemeral: true });
    });
}

/*
Prints a users nicknames
*/
function printNicknames(interaction, userId) {
    var names = getNames();
    if(!names[userId]) {
        interaction.reply({ content: 'User has no holiday names', ephemeral: true });
        return;
    }
    printHolidays(interaction, userId, names[userId]);
}