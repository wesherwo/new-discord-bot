const { SlashCommandBuilder } = require('@discordjs/builders');
const userChannels = require('./userVoiceChannels.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick-user-from-channel')
		.setDescription('Kicks a user from the owners channel')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),
	async execute(client, interaction) {
		kick(interaction);
	},
};

function kick(interaction) {
    var member = interaction.options.getMember('target');
    var chan = userChannels.getOwnedChannel(interaction.member);
    if (chan != null) {
        if (member.voice.channelId == chan.id) {
            member.voice.disconnect('Kicked by channel owner.');
            interaction.reply({ content: 'User kicked form your channel', ephemeral: true });
            return;
        }
        interaction.reply({ content: 'User not found in your channel', ephemeral: true }); 
        return;
    }
    interaction.reply({ content: 'Could not find your channel', ephemeral: true });
}