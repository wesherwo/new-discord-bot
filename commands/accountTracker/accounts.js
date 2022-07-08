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
		  subcommand.setName('delete')
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
    } else if(interaction.options.getSubcommand() == 'add-to-list') {
      addAccounts(interaction);
    } else if(interaction.options.getSubcommand() == 'delete') {
      removeAccountFromList(interaction);
    } else if(interaction.options.getSubcommand() == 'update') {
      updateAccountRank(interaction);
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

function removeAccountFromList(interaction) {
  var lists = accTrack.getLists();
  var list = accTrack.getListName(interaction.options.getString('list'));
  var account = accTrack.getAccountName(interaction.options.getString('account'), game);
  if(accTrack.listExists(list)) {
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
  accTrack.setLists(lists);
  interaction.reply({ content: 'Account removed from list.', ephemeral: true });
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