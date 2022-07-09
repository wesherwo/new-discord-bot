const { SlashCommandBuilder } = require('@discordjs/builders');
const accTrack = require('./_accountTracker.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('at-account')
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
		  subcommand.setName('add-to-list')
		    .setDescription('add an account to a list')
		    .addStringOption(option => option.setName('list').setDescription('Name of the list to add the account to').setRequired(true))
        .addStringOption(option => option.setName('accounts').setDescription('Accounts to add to the list seperated by a comma').setRequired(true)))
	  .addSubcommand(subcommand =>
		  subcommand.setName('remove-from-list')
		    .setDescription('removes accounts from a list')
		    .addStringOption(option => option.setName('list').setDescription('Name of the list to add the account to').setRequired(true))
        .addStringOption(option => option.setName('accounts').setDescription('Account to add to the list seperated by a comma').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('update')
        .setDescription('update an account rank')
        .addStringOption(option => option.setName('account').setDescription('Name of the account').setRequired(true))
        .addStringOption(option => option.setName('game').setDescription('Valorant/Rocket League/Overwatch')
          .addChoices({name: 'Valorant', value: 'valorant'},
                      {name: 'Rocket League', value: 'rocket-league'},
                      {name: 'Overwatch', value: 'overwatch'})
                      .setRequired(true))
        .addStringOption(option => option.setName('rank').setDescription('New rank of the account').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('delete')
        .setDescription('Delete an account')
        .addStringOption(option => option.setName('account').setDescription('Name of the account').setRequired(true))
        .addStringOption(option => option.setName('game').setDescription('Valorant/Rocket League/Overwatch')
          .addChoices({name: 'Valorant', value: 'valorant'},
                      {name: 'Rocket League', value: 'rocket-league'},
                      {name: 'Overwatch', value: 'overwatch'})
                      .setRequired(true))),
  async execute(client, interaction) {
    if(interaction.options.getSubcommand() == 'new') {
      addNewAccount(interaction);
    } else if(interaction.options.getSubcommand() == 'add-to-list') {
      addAccounts(interaction);
    } else if(interaction.options.getSubcommand() == 'remove-from-list') {
      removeAccountsFromList(interaction);
    } else if(interaction.options.getSubcommand() == 'update') {
      updateAccountRank(interaction);
    } else if(interaction.options.getSubcommand() == 'delete') {
      deleteAccount(interaction);
    }
  }
}

function addNewAccount(interaction) {
  var accounts= accTrack.getAccounts();
  var game = interaction.options.getString('game');
  var account = interaction.options.getString('account');
  if(!accTrack.accountExists(account, game)) {
    accounts[game][account] = interaction.options.getString('rank')
  } else {
    interaction.reply({ content: 'Account already exists.', ephemeral: true });
    return;
  }
  accTrack.setAccounts(accounts);
  interaction.reply({ content: 'Account added.', ephemeral: true });
}

function addAccounts(interaction) {
  var list = accTrack.getListName(interaction.options.getString('list'));
  if(!list) {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var accsToAdd = interaction.options.getString('accounts').split(',');
  errorAdding = accTrack.addAccountsToList(accsToAdd, list);
  var returnMsg = 'List Updated.';
  errorAdding.forEach(acc => {
    returnMsg += '\nError adding ' + acc;
  });
  interaction.reply({ content: returnMsg, ephemeral: true });
}

function removeAccountsFromList(interaction) {
  var lists = accTrack.getLists();
  var list = accTrack.getListName(interaction.options.getString('list'));
  if(!list) {
    interaction.reply({ content: 'List does not exist.', ephemeral: true });
    return;
  }
  var game = lists[list].game;
  var accounts = interaction.options.getString('accounts').split(',');
  var returnMessage = 'Accounts removed from list.';
  accounts.forEach(acc => {
    var account = accTrack.getAccountName(acc, game);
    var index = lists[list].accounts.indexOf(account);
    if(index >= 0) {
      lists[list].accounts.splice(index, 1);
    } else {
      returnMessage += '\nError removing ' + acc;
    }
  });
  accTrack.setLists(lists);
  interaction.reply({ content: returnMessage, ephemeral: true });
}

function updateAccountRank(interaction) {
  var accounts = accTrack.getAccounts();
  var game = interaction.options.getString('game');
  var account = accTrack.getAccountName(interaction.options.getString('account'), game);
  if(accTrack.accountExists(account, game)) {
    accounts[game][account] = interaction.options.getString('rank');
  } else {
    interaction.reply({ content: 'Account does not exist.', ephemeral: true });
    return;
  }
  accTrack.setAccounts(accounts);
  interaction.reply({ content: 'Account rank updated.', ephemeral: true });
}

function deleteAccount(interaction) {
  var accounts = accTrack.getAccounts();
  var lists = accTrack.getLists();
  var game = interaction.options.getString('game');
  var account = accTrack.getAccountName(interaction.options.getString('account'), game);
  if(account) {
    delete accounts[game][account];
  } else {
    interaction.reply({ content: 'Account does not exist.', ephemeral: true });
    return;
  }
  accTrack.setAccounts(accounts);
  Object.keys(lists).forEach(list => {
    if(lists[list].game == game) {
      for(let i = 0; i < lists[list].accounts.length; i++) {
        if(lists[list].accounts[i].localeCompare(account) == 0) {
          lists[list].accounts.splice(i,1);
        }
      }
    }
  });
  accTrack.setLists(lists);
  interaction.reply({ content: 'Account deleted.', ephemeral: true });
}