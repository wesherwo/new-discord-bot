const { SlashCommandBuilder } = require('@discordjs/builders');
const accTrack = require('./_accountTracker.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('at-list')
    .setDescription('Create/Rename/Detete an account list')
    .addSubcommand(subcommand =>
			subcommand.setName('create')
			.setDescription('Creates a new account list')
			.addStringOption(option => option.setName('name').setDescription('Name for the list').setRequired(true))
      .addStringOption(option => option.setName('game')
					.setDescription('Valorant/Rocket League/Overwatch')
					.addChoices({name: 'Valorant', value: 'valorant'},
					            {name: 'Rocket League', value: 'rocket-league'},
					            {name: 'Overwatch', value: 'overwatch'})
					.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
			.setDescription('Deletes an account list')
			.addStringOption(option => option.setName('name').setDescription('Name of the list to delete').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('rename')
      .setDescription('Renames an account list')
      .addStringOption(option => option.setName('name').setDescription('Name of the list to rename').setRequired(true))
      .addStringOption(option => option.setName('new-name').setDescription('New name for the list').setRequired(true))),
  async execute(client, interaction) {
    if(interaction.options.getSubcommand() == 'create') {
      makeList(interaction);
    } else if(interaction.options.getSubcommand() == 'delete') {
      deleteList(interaction);
    } else if(interaction.options.getSubcommand() == 'rename') {
      renameList(interaction);
    }
  }
}

function makeList(interaction) {
  var lists = accTrack.getLists();
  var list = interaction.options.getString('name');
  if (!accTrack.listExists(list)) {
    lists[list] = {"game":interaction.options.getString('game'),"accounts":[]};
  } else {
    interaction.reply({ content: 'List already exists.', ephemeral: true });
    return;
  }
  accTrack.setLists(lists);
  interaction.reply({ content: 'List created.', ephemeral: true });
}

function deleteList(interaction) {
  var lists = accTrack.getLists();
  var list = accTrack.getListName(interaction.options.getString('name'));
  if (accTrack.listExists(list)) {
    delete lists[list];
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  accTrack.setLists(lists);
  interaction.reply({ content: 'List deleted.', ephemeral: true });
}

function renameList(interaction) {
  var lists = accTrack.getLists();
  var list = accTrack.getListName(interaction.options.getString('name'));
  var newName = interaction.options.getString('new-name');
  if (accTrack.listExists(list)) {
    if (!accTrack.listExists(newName)) {
      lists[newName] = lists[list];
      delete lists[list];
    } else {
      interaction.reply({ content: 'List with new name already exists.', ephemeral: true });
      return;
    }
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  accTrack.setLists(lists);
  interaction.reply({ content: 'List renamed.', ephemeral: true });
}