const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Shows details of the currently playing song')
    .addIntegerOption(option => option.setName('index')
      .setDescription('That song index')
      .setRequired(true)),
  async execute(client, interaction) {
    let index = interaction.options.getNumber("index") - 1;
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.queueIndex(index, queue, interaction)) return;

    const song = queue.tracks[index]

    const embed = client.say.baseEmbed(interaction)
      .setAuthor("Now Playing 🎵")
      .setTitle(`${song.title}`)
      .setURL(`${song.url}`)
      .setThumbnail(`${song.thumbnail}`)
      .setDescription(`~ Requested by: ${song.requestedBy.toString()}
                      Duration: ${song.duration}
                      Position in queue: ${index}`);

    return interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
  }
};