const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = 'saveData/accountLists.json';

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
      .addStringOption(option => option.setName('new-name').setDescription('New name for the list').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('display')
      .setDescription('Displays lists')),
  async execute(client, interaction) {
    if(interaction.options.getSubcommand() == 'create') {
      makeList(interaction);
    } else if(interaction.options.getSubcommand() == 'delete') {
      deleteList(interaction);
    } else if(interaction.options.getSubcommand() == 'rename') {
      renameList(interaction);
    } else if(interaction.options.getSubcommand() == 'display') {
      printLists(interaction);
    }
  }
}

function makeList(interaction) {
  var lists = JSON.parse(fs.readFileSync(path));
  if (!lists.hasOwnProperty(interaction.options.getString('name'))) {
    lists[interaction.options.getString('name')] = {"game":interaction.options.getString('game'),"accounts":[]};
  } else {
    interaction.reply({ content: 'List already exists.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(lists);
  fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'List created.', ephemeral: true });
}

function deleteList(interaction) {
  var lists = JSON.parse(fs.readFileSync(path));
  if (lists.hasOwnProperty(interaction.options.getString('name'))) {
    delete lists[interaction.options.getString('name')];
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(lists);
  fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'List deleted.', ephemeral: true });
}

function renameList(interaction) {
  var lists = JSON.parse(fs.readFileSync(path));
  if (lists.hasOwnProperty(interaction.options.getString('name'))) {
    if (!lists.hasOwnProperty(interaction.options.getString('new-name'))) {
      lists[interaction.options.getString('new-name')] = lists[interaction.options.getString('name')];
      delete lists[interaction.options.getString('name')];
    } else {
      interaction.reply({ content: 'List with new name already exists.', ephemeral: true });
      return;
    }
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(lists);
  fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'List renamed.', ephemeral: true });
}

function printLists(interaction) {
  var lists = JSON.parse(fs.readFileSync(path));
  var sorted = [];
  for (var list in lists) {
    sorted.push([list, list.game]);
  }
  sorted.sort(function (a, b) { return b[0] - a[0] });
  let toSend = [];
	toSend.push('```xl');
	for (let i = 0; i < sorted.length; i++) {
		toSend.push(sorted[i][0] + '(' + sorted[i][1] + ')');
	}
	toSend.push('```');
	interaction.reply({content: toSend.join('\n'), ephemeral: true });
}