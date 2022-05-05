const { SlashCommandBuilder } = require('@discordjs/builders');
const userChannels = require('./userVoiceChannels.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allow-user-in-channel')
		.setDescription('Allows a user to join the owners channel')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),
	async execute(client, interaction) {
		allow(interaction);
	},
};

function allow(interaction) {
    var member = interaction.options.getMember('target');
    var chan = userChannels.getOwnedChannel(interaction.member);
    if (chan != null) {
        chan.permissionOverwrites.edit(member.id, {CONNECT: true});
        interaction.reply({ content: 'User granted permissions', ephemeral: true });
        return;
    }
    interaction.reply({ content: 'Could not find your channel', ephemeral: true });
}