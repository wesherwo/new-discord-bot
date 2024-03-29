const { SlashCommandBuilder } = require('@discordjs/builders');
const userChannels = require('./_userVoiceChannels.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rename-channel')
		.setDescription('Renames the users channel')
        .addStringOption(option => option.setName('name').setDescription('Name for the channel').setRequired(true)),
	async execute(client, interaction) {
		rename(interaction);
	},
};

function rename(interaction) {
    var newName = interaction.options.getString('name');
    var chan = userChannels.getOwnedChannel(interaction.member);
    if (chan != null) {
        chan.setName(newName, 'Owner changed name');
        interaction.reply({ content: 'Name Changed', ephemeral: true });
        return;
    }
    interaction.reply({ content: 'Could not find your channel', ephemeral: true });
}