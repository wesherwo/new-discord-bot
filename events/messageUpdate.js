const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'messageUpdate',
	async execute(client, oldMessage, newMessage) {
		if (oldMessage.member == null || oldMessage.author.id == client.user.id) {
            return;
        }
        let embed = new EmbedBuilder();
        embed.setColor(13632027).setAuthor({name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL()}).setTimestamp()
            .setDescription(`Message edited in <#${oldMessage.channel.id}> [Jump to Message](${oldMessage.url})`)
            .addField('Before', oldMessage.content)
            .addField('After', newMessage.content);
        client.channels.cache.find(val => val.name === 'bot-cmds').send({embeds: [embed]});
	},
};