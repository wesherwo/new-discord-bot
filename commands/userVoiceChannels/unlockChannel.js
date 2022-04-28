const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const Permissions = Discord.Permissions;
const userChannels = require('./userVoiceChannels.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock-channel')
		.setDescription('Unlocks the users channel'),
	async execute(interaction) {
		unlock(interaction);
	},
};

function unlock(interaction) {
    var chan = userChannels.getOwnedChannel(interaction.member);
    if (chan != null) {
        chan.permissionOverwrites.set([
                {
                    id: interaction.guild.roles.everyone.id,
                    allow: [Permissions.FLAGS.CONNECT]
                }
            ],
            'Owner unlocked channel'
        );
        interaction.reply({ content: 'Channel unlocked', ephemeral: true });
        return;
    }
    interaction.reply({ content: 'Could not find your channel', ephemeral: true });
}