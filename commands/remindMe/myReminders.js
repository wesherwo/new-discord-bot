const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = 'saveData/reminders.json';

var reminders;
var pingSubscriptions = '';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my-reminders')
		.setDescription('Displays any reminders you are subscribed to'),
	async execute(client, interaction) {
        await interaction.deferReply();
		myReminders(client, interaction);
	},
};

function myReminders (client, interaction) {
    pingSubscriptions = '';
    reminders = JSON.parse(fs.readFileSync(path));
    Object.entries(reminders).forEach(([messageID,chanID]) => {
        client.channels.fetch(chanID).then(chan => chan.messages.fetch(messageID).then(message => {
            message.reactions.cache.each(reaction => {
                var reacted = false;
                reaction.users.fetch().then(getUsers => getUsers.each(user => {
                    if(user.id == interaction.user.id && !reacted){
                        reacted = true;
                        var time = message.content.substring(38, message.content.indexOf('for:')).trim();
                        var msg = message.content.substring(message.content.indexOf('\n')+1).trim();
                        pingSubscriptions += time + '\n' + msg + '\n\n';
                        console.log(pingSubscriptions);
                    }
                }));
            });
        }));
    });
    setTimeout(sendReminders, 5000, interaction);
}

async function sendReminders(interaction) {
    if(pingSubscriptions == '') {
        await interaction.editReply({ content: 'You are not subscribed to any reminders', ephemeral: true });
    } else {
        await interaction.editReply({ content: pingSubscriptions, ephemeral: true });
    }
}