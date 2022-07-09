const { SlashCommandBuilder } = require('@discordjs/builders');
const accTrack = require('./_accountTracker.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('at-print')
		.setDescription('Displays accounts and account lists')
		.addSubcommand(subcommand =>
			subcommand.setName('lists')
				.setDescription('Displays lists'))
		.addSubcommand(subcommand =>
			subcommand.setName('display')
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
		} else if (interaction.options.getSubcommand() == 'display') {
			printList(interaction);
		} else if (interaction.options.getSubcommand() == 'accounts') {
			printAccounts(interaction);
		}
	},
};

function printLists(interaction) {
    var lists = accTrack.getLists();
    if(Object.keys(lists).length == 0) {
        interaction.reply({ content: 'No list yet.', ephemeral: true });
        return;
    }
    var toSend = [];
    toSend.push('```xl');
    Object.keys(lists).sort(function (a, b) { 
                                return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()) 
                            }).forEach(list => toSend.push(list + ' - ' + lists[list].game))
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}

function printList(interaction) {
    var lists = accTrack.getLists();
    var accounts = accTrack.getAccounts();
    var list = accTrack.getListName(interaction.options.getString('name'));
    if (accTrack.listExists(list)) {
        if(lists[list].accounts.length == 0) {
            interaction.reply({ content: 'No accounts in this list yet.', ephemeral: true });
            return;
        }
        var toSend = [];
        toSend.push('```xl');
        lists[list].accounts.sort(function (a, b) {
                                    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()) 
                                }).forEach(account => toSend.push(account + ' - ' + accounts[lists[list].game][account]));
        toSend.push('```');
	    interaction.reply(toSend.join('\n'));
    } else {
        interaction.reply({ content: 'List does not exist.', ephemeral: true });
        return;
    }
}

function printAccounts(interaction) {
    var accounts = accTrack.getAccounts();
    var game = interaction.options.getString('game');
    if(Object.keys(accounts[game]).length == 0) {
        interaction.reply({ content: 'No accounts for that game yet.', ephemeral: true });
        return;
    }
    var toSend = [];
    toSend.push('```xl');
    Object.keys(accounts[game]).sort().forEach(account => toSend.push(account + ' - ' + accounts[game][account]))
	toSend.push('```');
	interaction.reply(toSend.join('\n'));
}