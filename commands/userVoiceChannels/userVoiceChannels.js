const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');

var userChannelCategory;
var channels = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('make-channel')
		.setDescription('Creates a channel for the user and moves the user to the channel')
        .addStringOption(option => option.setName('name').setDescription('Name for the channel')),
	async execute(client, interaction) {
		makeChannelByCommand(client, interaction);
	},
};

module.exports.startup = (client) => {
    userChannelCategory = client.channels.cache.find(val => val.name === 'Join to create channel');
    if (userChannelCategory == null) {
        var guild = client.guilds.cache.at(0);
        guild.channels.create({ name: 'USER CHANNELS', type: ChannelType.GuildCategory }).then(parent => {
            guild.channels.create({ name: 'Join to create channel',  type: ChannelType.GuildVoice }).then(chan => {
                chan.setParent(parent);
            });
        });
        userChannelCategory = client.channels.cache.find(val => val.name === 'Join to create channel');
    }
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        if (newMember.member.voice.channel != null && newMember.member.voice.channel.id == userChannelCategory.id) {
            makeChannelByJoin(client, newMember.member);
        }
    });
}

module.exports.getOwnedChannel = (member) => {
    chans = userChannelCategory.parent.children.cache;
    var foundChan = null;
    chans.each(chan => {
        if (channels[chan.id] != undefined && channels[chan.id].owner == member) {
            foundChan = chan;
        }
    });
    return foundChan;
}

function makeChannelByJoin(client, member) {
    var name = member.displayName;
    name += "'s VC";
    makeChannel(client, member, name);
}

function makeChannelByCommand(client, interaction) {
    var name = interaction.options.getString('name');
    if (name == null) {
        name = interaction.member.displayName;
        name += "'s VC";
    }
    makeChannel(client, interaction.member, name);
    interaction.reply({ content: 'Channel created', ephemeral: true });
}

function makeChannel(client, member, name) {
    client.guilds.cache.at(0).channels.create({ name: name, type: ChannelType.GuildVoice }).then(chan => { moveUser(member, chan); });
}

function moveUser(member, chan) {
    channels[chan.id] = { 'owner': member };
    chan.setParent(userChannelCategory.parent, {lockPermissions:false});
    if (member.voice.channel != null) {
        member.voice.setChannel(chan);
    }
    setTimeout(checkIfEmpty(chan), 2500);
    return;
}

function checkIfEmpty(chan) {
    return function () {
        if (chan.members.size == 0) {
            delete channels[chan.id];
            chan.delete();
            return;
        }
        setTimeout(checkIfEmpty(chan), 2500);
        return;
    }
}