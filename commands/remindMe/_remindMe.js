const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = 'saveData/reminders.json';

var botcmds;
var reminders;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind-me')
		.setDescription('Sets a reminder for the user')
        .addIntegerOption(option => option.setName('month').setDescription('Month for the reminder').setRequired(true))
        .addIntegerOption(option => option.setName('day').setDescription('Day for the reminder').setRequired(true))
        .addIntegerOption(option => option.setName('hour').setDescription('Hour for the reminder').setRequired(true))
        .addIntegerOption(option => option.setName('minute').setDescription('Time for the reminder').setRequired(true))
        .addStringOption(option =>option.setName('am-pm').setDescription('AM/PM').addChoices({name: 'AM', value: 'am'},{name: 'PM', value: 'pm'}).setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Message to remind user').setRequired(true)),
	async execute(client, interaction) {
		ping(interaction, true);
	},
};

module.exports.startup = (client) => {
    botcmds = client.channels.cache.find(val => val.name === 'bot-cmds');
    reminders = JSON.parse(fs.readFileSync(path));
    Object.entries(reminders).forEach(([messageID,chanID]) => {
        client.channels.fetch(chanID).then(chan => chan.messages.fetch(messageID).then(message => ping(message, false)));
    });
}

async function ping (interaction, newInteraction) {
    var pingTime = new Date();
    var message = interaction;
    if(newInteraction) {
        if (interaction.options.getInteger('month') > 12 || interaction.options.getInteger('day') > 31) {
            interaction.reply({ content: 'Date must be valid', ephemeral: true });
            return;
        }
        if (interaction.options.getInteger('hour') > 12 || interaction.options.getInteger('minute') > 59) {
            interaction.reply({ content: 'Time must be valid', ephemeral: true });
            return;
        }
        pingTime.setMonth(interaction.options.getInteger('month') - 1);
        pingTime.setDate(interaction.options.getInteger('day'));
        pingTime.setHours(interaction.options.getInteger('hour'));
        if (interaction.options.getString('am-pm') == 'pm' && interaction.options.getInteger('hour') != 12) {
            pingTime.setHours(pingTime.getHours() + 12);
        }
        pingTime.setMinutes(interaction.options.getInteger('minute'));
        pingTime.setSeconds(0);
        var dateString = pingTime.toLocaleString();
        var currTime = new Date();
        var timer = pingTime.getTime() - currTime.getTime();
        if(timer < 0){
            pingTime.setFullYear(pingTime.getFullYear() + 1);
        }
        var date = new Date();
        dateString = dateString.substring(0,dateString.indexOf(':00')) + dateString.substring(dateString.indexOf(':00') + 3);
        interaction.reply(`React to this message to be pinged at ${dateString} <t:${Math.floor((pingTime.getTime()) / 1000)}:R> for:\n\n` + interaction.options.getString('message'));
        message = await interaction.fetchReply();
        reminders[message.id] = message.channel.id;
        var jsonData = JSON.stringify(reminders);
        fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
    } else {
        date = interaction.content.substring(interaction.content.indexOf('at')+3, interaction.content.indexOf('<t')).trim().replaceAll(" "," ");
        pingTime.setTime(Date.parse(date));
    }

    var currTime = new Date();
    var timer = pingTime.getTime() - currTime.getTime();
    if(timer < 0){
        console.log('Must be a time in the future.  Ping has been deleted.');
        deletePing(interaction);
        return;
    }
    let embed = new EmbedBuilder();
    embed.setColor(13632027).setAuthor({name: message.interaction.user.username, iconURL: message.interaction.user.displayAvatarURL()}).setTimestamp()
        .setDescription('Ping set for ' + pingTime);
    botcmds.send({embeds: [embed]});

    if(timer > 2073600000){
        setTimeout(ping, 2073600000, message);
    } else {
        setTimeout(pingNow, timer, message);
    }
}

function pingNow(message) {
    var messaged = {};
    message.reactions.cache.each(reaction => {
        reaction.users.fetch().then(getUsers => getUsers.each(user => {
            if(messaged[user.username] == undefined){
                messaged[user.username] = true;
                user.send(message.content.substring(message.content.indexOf('\n')+1).trim());
            }
        }));
    });
    deletePing(message);
}

function deletePing(message) {
    delete reminders[message.id];
    var jsonData = JSON.stringify(reminders);
    fs.writeFileSync(path, jsonData, function (err) { if (err) { console.log(err); } });
}