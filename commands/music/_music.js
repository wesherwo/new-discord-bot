const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music-help')
        .setDescription('Shows commands for music'),
    async execute(client, interaction) {
        let embed = new EmbedBuilder();
        embed.setColor(3447003).setTitle('List of commands').addFields(
            [{ name: 'clear', value: 'Clears the current queue' },
            { name: 'jump', value: 'Jump to a specific track in the queue' },
            { name: 'loop', value: 'Change the loop mode (autoplay|track|queue|off)' },
            { name: 'lyrics', value: 'Get lyrics for a song' },
            { name: 'nowplaying', value: 'Shows details of the currently playing song' },
            { name: 'pause', value: 'Pauses the current playing song' },
            { name: 'play', value: 'Play a song or playlist from url or name' },
            { name: 'queue', value: 'Shows the queue' },
            { name: 'remove', value: 'Removes a specific song from the queue' },
            { name: 'resume', value: 'Resumes the current paused song' },
            { name: 'seek', value: 'Seeks to a specific position in the current song' },
            { name: 'shuffle', value: 'Shuffles the queue' },
            { name: 'skip', value: 'Skips the current song' },
            { name: 'stop', value: 'Stops the playback' },
            { name: 'volume', value: 'Check or change the volume' },
            { name: 'watchtogether', value: 'Starts a youtube watch together activity voice session' }]);
        interaction.reply({ ephemeral: true, embeds: [embed] });
    },
};

module.exports.modifyQueue = (interaction) => {
    const memberChannelId = interaction.member?.voice?.channelId;
    const botChannelId = interaction.guild.me?.voice?.channelId;

    if (!memberChannelId) {
        interaction.reply({ content: 'You need to join a voice channel first', ephemeral: true });
        return false;
    }

    if (memberChannelId !== botChannelId) {
        interaction.reply({ content: 'You must be in the same voice channel as me', ephemeral: true });
        return false;
    }
    return true;
}

module.exports.currentlyPlaying = (queue, interaction) => {
    if (!queue || !queue.playing) {
        interaction.reply({ content: "I'm currently not playing in this guild", ephemeral: true });
        return false;
    }
    return true;
}

module.exports.queueLength = (queue, interaction) => {
    if (queue.tracks.length < 1) {
        interaction.reply({ content: 'There is currently no song in the queue', ephemeral: true });
        return false;
    }
    return true;
}

module.exports.queueIndex = (index, queue, interaction) => {
    if (index > queue.tracks.length || index < 0 || !queue.tracks[index]) {
        interaction.reply({ content: 'Provided song index does not exist', ephemeral: true });
        return false;
    }
    return true;
}