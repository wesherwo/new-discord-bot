const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	async execute(client, message) {
		let embed = new EmbedBuilder();
        embed.setColor(13632027).setAuthor({name: message.author.username, iconURL: message.author.displayAvatarURL()}).setTimestamp()
        .setDescription(`Message sent by <@${message.member.id}> deleted in <#${message.channel.id}>\n${message.content}`);
        client.channels.cache.find(val => val.name === 'bot-cmds').send({embeds: [embed]});
	},
};