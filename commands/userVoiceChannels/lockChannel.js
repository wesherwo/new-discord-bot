const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const Permissions = Discord.Permissions;
const userChannels = require('./userVoiceChannels.js');

var bot;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock-channel')
		.setDescription('Locks the users channel'),
	async execute(interaction) {
		lock(interaction);
	},
};

module.exports.startup = (client) => {
    bot = client;
}

function lock(interaction) {
    var chan = userChannels.getOwnedChannel(interaction.member);
    if (chan != null) {
        chan.permissionOverwrites.set([
                {
                    id: interaction.member.id,
                    allow: [Permissions.FLAGS.CONNECT]
                },
                {
                    id: bot.user.id,
                    allow: [Permissions.FLAGS.CONNECT]
                },
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [Permissions.FLAGS.CONNECT]
                }
            ],
            'Owner locked channel'
        );
        interaction.reply({ content: 'Channel locked', ephemeral: true });
        return;
    }
    interaction.reply({ content: 'Could not find your channel', ephemeral: true });
}