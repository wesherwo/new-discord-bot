const { SlashCommandBuilder } = require('@discordjs/builders');
const { getRoles, setRoles } = require('../../modules/holidayChanger/saveData');
const { sortHolidays } = require('../../modules/holidayChanger/holidays');
const { holidaySelection, nameModal, printHolidays } = require('../../modules/holidayChanger/messageComponents');
const { updateForRoleChange } = require('../../modules/holidayChanger/updaters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-role')
		.setDescription('Edit holiday names for a role')
        .addSubcommand(subcommand =>
            subcommand.setName('default')
                .setDescription('Sets a default role name when it is not a holiday')
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Roles default name').setRequired(true))
                .addStringOption(option => option.setName('color').setDescription('Roles color for when its not a holiday(hex #FF0000)').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('update')
                .setDescription('Updates a role name for a holiday')
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a role name for a holiday')
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays holiday role names')
                .addRoleOption(option => option.setName('role').setDescription('Role for the name').setRequired(true))),
        
    async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'default') {
            defaultRole(interaction, interaction.options.getRole('role').id);
        } else if (interaction.options.getSubcommand() == 'update') {
            updateRole(interaction, interaction.options.getRole('role').id);
        } else if (interaction.options.getSubcommand() == 'remove') {
            removeRole(interaction, interaction.options.getRole('role').id);
        } else if (interaction.options.getSubcommand() == 'print') {
            printRole(interaction, interaction.options.getRole('role').id);
        }
    },
};

/*
Updates a roles default name
*/
function defaultRole(interaction, roleId) {
    //All role names
    var names = getRoles();

    //Specific role names
    var roleNames = names[roleId];

    //If role has no names set names so one can be added
    if(!roleNames) { roleNames = {}; }

    roleNames['default'] = {'name':interaction.options.getString('name'), 'color':interaction.options.getString('color')};
    names[roleId] = roleNames;
    setRoles(names);
    updateForRoleChange('default', roleId);
    interaction.reply({content: `Default role has been updated to ${interaction.options.getString('name')}`, ephemeral: true });
}

/*
Updates a role name for a given holiday
*/
function updateRole(interaction, roleId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All role names
    var names = getRoles();

    //Specific role names
    var roleNames = names[roleId];

    //If role has no names set names so one can be added
    if(!roleNames) { roleNames = {}; }
    
    var actionText = 'update the role name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, roleNames).then((holidayResponse) => {
        nameModal(holidayResponse[1], true).then(nameResponse => {
            roleNames[holidayResponse[0]] = {'name':nameResponse[0], 'color':nameResponse[1]};
            names[roleId] = roleNames;
            setRoles(names);
            updateForRoleChange(holidayResponse[0], roleId);
            nameResponse[2].reply({content: `Role has been updated to ${nameResponse[0]} for ${holidayResponse[0]}`, ephemeral: true });
        });
    });
}

/*
Removes selected roles name
*/
function removeRole(interaction, roleId) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    //All role names
    var names = getRoles();

    //Specific role names
    var roleNames = names[roleId];

    //If role has no names set names so one can be added
    if(!roleNames) { roleNames = {}; }
    
    var actionText = 'remove the role name for';
    // Select holiday to edit
    holidaySelection(interaction, actionText, roleNames).then((holidayResponse) => {
        delete roleNames[holidayResponse[0]];
        names[roleId] = roleNames;
        setRoles(names);
        updateForRoleChange(holidayResponse[0], roleId);
        holidayResponse[1].reply({content: `Role name has been removed for ${holidayResponse[0]}`, ephemeral: true });
    });
}

/*
Prints a roles holiday names
*/
function printRole(interaction, roleId) {
    var names = getRoles();
    if(!names[roleId]) {
        interaction.reply({ content: 'Role has no holiday names', ephemeral: true });
        return;
    }
    printHolidays(interaction, roleId, names[roleId]);
}