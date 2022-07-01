const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const listPath = 'saveData/accountLists.json';
const accountsPath = 'saveData/accounts.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('at-print')
		.setDescription('Displays accounts and account lists')
		.addSubcommand(subcommand =>
			subcommand.setName('lists')
				.setDescription('Displays lists'))
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Displays accounts in a list')
                .addStringOption(option => option.setName('name').setDescription('Name of the list to delete').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('accounts')
				.setDescription('Displays all accounts')
                .addStringOption(option => option.setName('game').setDescription('Valorant/Rocket League/Overwatch')
					.addChoices({name: 'Valorant', value: 'valorant'},
					            {name: 'Rocket League', value: 'rocket-league'},
					            {name: 'Overwatch', value: 'overwatch'})
                                .setRequired(true))),
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'lists') {
			printLists(interaction);
		} else if (interaction.options.getSubcommand() == 'list') {
			printList(interaction);
		} else if (interaction.options.getSubcommand() == 'accounts') {
			printAccounts(interaction);
		}
	},
};

function printLists(interaction) {
    var lists = JSON.parse(fs.readFileSync(listPath));
    if(Object.keys(lists).length == 0) {
        interaction.reply({ content: 'No list yet.', ephemeral: true });
        return;
    }
    var toSend = [];
    toSend.push('```xl');
    Object.keys(JSON.parse(fs.readFileSync(listPath))).forEach(list => toSend.push(list + ' - ' + lists[list].game))
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}

function printList(interaction) {
    var lists = JSON.parse(fs.readFileSync(listPath));
    var accounts = JSON.parse(fs.readFileSync(accountsPath));
    var list = interaction.options.getString('name');
    if (lists.hasOwnProperty(list)) {
        if(lists[list].accounts.length == 0) {
            interaction.reply({ content: 'No accounts in this list yet.', ephemeral: true });
            return;
        }
        var toSend = [];
        toSend.push('```xl');
        lists[list].accounts.forEach(account => toSend.push(accounts[lists[list].game] + ' - ' + accounts[Lists[list].game][account]));
        toSend.push('```');
	    interaction.reply(toSend.join('\n'));
    } else {
        interaction.reply({ content: 'List does not exist.', ephemeral: true });
        return;
    }
}

function printAccounts(interaction) {
    var accounts = JSON.parse(fs.readFileSync(accountsPath));
    var game = interaction.options.getString('game');
    if(Object.keys(accounts[game]).length == 0) {
        interaction.reply({ content: 'No accounts for that game yet.', ephemeral: true });
        return;
    }
    var toSend = [];
    toSend.push('```xl');
    Object.keys(JSON.parse(fs.readFileSync(accountsPath))[game]).forEach(account => toSend.push(account + ' - ' + accounts[game][account]))
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}