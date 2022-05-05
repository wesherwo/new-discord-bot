const { SlashCommandBuilder } = require('@discordjs/builders');
const DJS = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from url or name')
    .addStringOption(option => option.setName('song').setDescription('The song name/url, you want to play').setRequired(true)),
  async execute(client, interaction) {
    try {
      if (!havePermissions(interaction)) {
        interaction.reply({ content: 'I need **\`EMBED_LINKS\`** permission', ephemeral: true });
        return;
      }

      const string = interaction.options.getString('song');
      const guildQueue = client.player.getQueue(interaction.guild.id);
      const channel = interaction.member.voice.channel;

      if (!channel) {
        interaction.reply({ content: 'You have to join a voice channel first', ephemeral: true });
        return;
      }

      if (guildQueue) {
        if (channel.id !== interaction.guild.me.voice.channelId) {
          interaction.reply({ content: "I'm already playing in a different voice channel", ephemeral: true });
          return;
        }
      } else {
        if (!channel.viewable) {
          interaction.reply({ content: 'I need **\`VIEW_CHANNEL\`** permission', ephemeral: true });
          return;
        }
        if (!channel.joinable) {
          interaction.reply({ content: 'I need **\`CONNECT_CHANNEL\`** permission', ephemeral: true });
          return;
        }
        if (!channel.speakable) {
          interaction.reply({ content: 'I need **\`SPEAK\`** permission', ephemeral: true });
          return;
        }
        if (channel.full) {
          interaction.reply({ content: "Can't join, the voice channel is full", ephemeral: true });
          return;
        }
      }

      let result = await client.player.search(string, { requestedBy: interaction.user }).catch(() => { });
      if (!result || !result.tracks.length) {
        interaction.reply({ content: `No result was found for \`${string}\``, ephemeral: true });
        return;
      }
      let queue;
      if (guildQueue) {
        queue = guildQueue;
        queue.metadata = interaction;
      } else {
        queue = await client.player.createQueue(interaction.guild, {
          metadata: interaction
        });
      }

      try {
        if (!queue.connection) await queue.connect(channel);
      } catch (error) {
        client.player.deleteQueue(interaction.guild.id);
        interaction.reply({ content: `Could not join your voice channel!\n\`${error}\``, ephemeral: true });
        return;
      }

      result.playlist ? queue.addTracks(result.tracks) : queue.addTrack(result.tracks[0]);

      if (!queue.playing) {
        await queue.play();
        interaction.reply({ content: 'I started playing music in your channel', ephemeral: true });
      } else {
        interaction.reply({ content: 'Added song to the queue', ephemeral: true });
      }
    } catch (e) {
      console.log(e);
    }
  }
};

function havePermissions(resolveable) {
  const ch = "channel" in resolveable ? resolveable.channel : resolveable;
  if (ch instanceof DJS.ThreadChannel || ch instanceof DJS.DMChannel) return true;

  return (
    ch.permissionsFor(resolveable.guild.me)?.has(DJS.Permissions.FLAGS.VIEW_CHANNEL) &&
    ch.permissionsFor(resolveable.guild.me)?.has(DJS.Permissions.FLAGS.SEND_MESSAGES) &&
    ch.permissionsFor(resolveable.guild.me)?.has(DJS.Permissions.FLAGS.EMBED_LINKS)
  );
}