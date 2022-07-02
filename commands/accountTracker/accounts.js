const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const listPath = 'saveData/accountLists.json';
const accountsPath = 'saveData/accounts.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('at-accounts')
    .setDescription('Add/Detete an account form list')
    .addSubcommand(subcommand =>
      subcommand.setName('new')
        .setDescription('add a new account')
        .addStringOption(option => option.setName('account').setDescription('Name of the account').setRequired(true))
        .addStringOption(option => option.setName('game').setDescription('Valorant/Rocket League/Overwatch')
					.addChoices({name: 'Valorant', value: 'valorant'},
					            {name: 'RocketLeague', value: 'rocket-league'},
					            {name: 'Overwatch', value: 'overwatch'})
                      .setRequired(true))
        .addStringOption(option => option.setName('rank').setDescription('Rank of the account').setRequired(true)))
    .addSubcommand(subcommand =>
		  subcommand.setName('add')
		    .setDescription('add an account to a list')
		    .addStringOption(option => option.setName('list').setDescription('Name of the list to add the account to').setRequired(true))
        .addStringOption(option => option.setName('account').setDescription('Account to add to the list').setRequired(true)))
	  .addSubcommand(subcommand =>
		  subcommand.setName('remove')
		    .setDescription('removes an account from a list')
		    .addStringOption(option => option.setName('list').setDescription('Name of the list to add the account to').setRequired(true))
        .addStringOption(option => option.setName('account').setDescription('Account to add to the list').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('update')
        .setDescription('update an account rank')
        .addStringOption(option => option.setName('account').setDescription('Name of the account').setRequired(true))
        .addStringOption(option => option.setName('game').setDescription('Valorant/Rocket League/Overwatch')
          .addChoices({name: 'Valorant', value: 'valorant'},
                      {name: 'Rocket League', value: 'rocket-league'},
                      {name: 'Overwatch', value: 'overwatch'})
                      .setRequired(true))
        .addStringOption(option => option.setName('rank').setDescription('New rank of the account').setRequired(true))),
  async execute(client, interaction) {
    if(interaction.options.getSubcommand() == 'new') {
      addNewAccount(interaction);
    } else if(interaction.options.getSubcommand() == 'add') {
      addAccountToList(interaction);
    } else if(interaction.options.getSubcommand() == 'remove') {
      removeAccountFromList(interaction);
    } else if(interaction.options.getSubcommand() == 'update') {
      updateAccountRank(interaction);
    }
  }
}

function addNewAccount(interaction) {
  var accounts = JSON.parse(fs.readFileSync(accountsPath));
  var game = interaction.options.getString('game');
  var account = interaction.options.getString('account');
  if(!accounts[game].hasOwnProperty(account)) {
    accounts[game][account] = interaction.options.getString('rank')
  } else {
    interaction.reply({ content: 'Account already exists.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(accounts);
  fs.writeFileSync(accountsPath, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'Account added.', ephemeral: true });
}

function addAccountToList(interaction) {
  var lists = JSON.parse(fs.readFileSync(listPath));
  var accounts = JSON.parse(fs.readFileSync(accountsPath));
  if(lists.hasOwnProperty(interaction.options.getString('list'))) {
    var account = accounts[lists[interaction.options.getString('list')].game][interaction.options.getString('account')]
    if(account) {
      lists[interaction.options.getString('list')].accounts.push(interaction.options.getString('account'));
    } else {
      interaction.reply({ content: 'Account does not exist.', ephemeral: true });
      return;
    }
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(lists);
  fs.writeFileSync(listPath, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'Account added to list.', ephemeral: true });
}

function removeAccountFromList(interaction) {
  var lists = JSON.parse(fs.readFileSync(listPath));
  var list = interaction.options.getString('list');
  var account = interaction.options.getString('account');
  if(lists.hasOwnProperty(list)) {
    var index = lists[list].accounts.indexOf(account);
    if(index >= 0) {
      lists[list].accounts.splice(index, 1);
    } else {
      interaction.reply({ content: 'Account not in list.', ephemeral: true });
      return;
    }
  } else {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(lists);
  fs.writeFileSync(listPath, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'Account removed from list.', ephemeral: true });
}

function updateAccountRank(interaction) {
  var accounts = JSON.parse(fs.readFileSync(accountsPath));
  var game = interaction.options.getString('game');
  var account = interaction.options.getString('account');
  if(accounts[game].hasOwnProperty(account)) {
    accounts[game][account] = interaction.options.getString('rank')
  } else {
    interaction.reply({ content: 'Account does not exist.', ephemeral: true });
    return;
  }
  var jsonData = JSON.stringify(accounts);
  fs.writeFileSync(accountsPath, jsonData, function (err) { if (err) { console.log(err); } });
  interaction.reply({ content: 'Account rank updated.', ephemeral: true });
}