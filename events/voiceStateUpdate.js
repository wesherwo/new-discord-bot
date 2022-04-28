const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'voiceStateUpdate',
	async execute(client, oldState, newState) {
		if (oldState.channel == newState.channel) {
            return;
        }
        let embed = new MessageEmbed();
        embed.setColor(13632027).setAuthor({name: oldState.member.user.username, iconURL: oldState.member.user.displayAvatarURL()}).setTimestamp();
        if (oldState.channel == null && newState.channel != null) {
            embed.setDescription(`<@${oldState.member.id}> joined voice channel <#${newState.member.voice.channel.id}>`);
        } else if (newState.channel == null && oldState.channel != null) {
            embed.setDescription(`<@${oldState.member.id}> left voice channel <#${oldState.channel.id}>`);
        } else {
            embed.setDescription(`<@${oldState.member.id}> switched voice channel <#${oldState.channel.id}> -> <#${newState.channel.id}>`);
        }
        client.channels.cache.find(val => val.name === 'bot-cmds').send({embeds: [embed]});
	},
};