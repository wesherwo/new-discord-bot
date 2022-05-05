const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song'),
  execute(client, interaction) {
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    if (queue.tracks.length < 1 && queue.repeatMode !== 3) {
      interaction.reply({ content: 'No more songs in the queue to skip', ephemeral: true });
      return;
    }
    queue.skip();
    interaction.reply({ content: 'Skipped to the next song', ephemeral: true });
  }
};