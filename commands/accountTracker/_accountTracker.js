const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const listPath = 'saveData/accountLists.json';
const accountsPath = 'saveData/accounts.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('at-help')
		.setDescription('Displays account tracker commands and how to use them'),
	async execute(client, interaction) {
		let embed = new MessageEmbed();
        embed.setColor(3447003).setTitle('List of commands').addFields(
            [{ name: 'at-account add-to-list', value: 'Add an account to a list' },
            { name: 'at-account delete', value: 'Delete an account' },
            { name: 'at-account new', value: 'Create a new account' },
            { name: 'at-account update', value: 'Update a accounts rank' },
            { name: 'at-list create', value: 'Creates a new list' },
            { name: 'at-list delete', value: 'Deletes a list' },
            { name: 'at-list rename', value: 'Get lyrics for a song' },
            { name: 'at-print accounts', value: 'Displays all accounts for a game' },
            { name: 'at-print display', value: 'Displays accounts for a list' },
            { name: 'at-print lists', value: 'Displays lists' },
            {name:'Basic usage',value:'1. at-list create\n2. at-account new\n3. at-account add\n4. at-print display'}]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
	},
};

module.exports.getLists = () => { return JSON.parse(fs.readFileSync(listPath));}
module.exports.setLists = (lists) => { 
    var jsonData = JSON.stringify(lists);
    fs.writeFileSync(listPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.listExists = (list) => {
    var exist = false;
    Object.keys(JSON.parse(fs.readFileSync(listPath))).forEach(l => {
        if(l.toLowerCase().localeCompare(list.toLowerCase()) == 0) {
            exist = true;
        }
    });
    return exist;
}

module.exports.getListName = (list) => {
    var listName = null;
    Object.keys(JSON.parse(fs.readFileSync(listPath))).forEach(l => {
        if(l.toLowerCase().localeCompare(list.toLowerCase()) == 0) {
            listName = l;
        }
    });
    return listName;
}

module.exports.getAccounts = () => { return JSON.parse(fs.readFileSync(accountsPath));}
module.exports.setAccounts = (accounts) => { 
    var jsonData = JSON.stringify(accounts);
    fs.writeFileSync(accountsPath, jsonData, function (err) { if (err) { console.log(err); } });
}

module.exports.accountExists = (account, game) => {
    var exist = false;
    Object.keys(JSON.parse(fs.readFileSync(accountsPath))[game]).forEach(acc => {
        if(acc.toLowerCase().localeCompare(account.toLowerCase()) == 0) {
            exist = true;
        }
    });
    return exist;
}

module.exports.getAccountName = (account, game) => {
    var accountName = null;
    Object.keys(JSON.parse(fs.readFileSync(accountsPath))[game]).forEach(acc => {
        if(acc.toLowerCase().localeCompare(account.toLowerCase()) == 0) {
            accountName = acc;
        }
    });
    return accountName;
}

module.exports.addAccountsToList = (accounts, list) => {
    var errorAdding = [];
    var lists = JSON.parse(fs.readFileSync(listPath));
    accounts.forEach(acc => {
        if(acc) {
            var accountName = null;
            Object.keys(JSON.parse(fs.readFileSync(accountsPath))[lists[list].game]).forEach(a => {
                if(a.toLowerCase().localeCompare(acc.toLowerCase().trim()) == 0) {
                    accountName = a;
                }
            });
            if(accountName) {
                lists[list].accounts.push(accountName);
            } else {
                errorAdding.push(acc);
            }
        }
    });
    var jsonData = JSON.stringify(lists);
    fs.writeFileSync(listPath, jsonData, function (err) { if (err) { console.log(err); } });
    return errorAdding;
}