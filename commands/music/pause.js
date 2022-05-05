const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the current playing song'),
  execute(client, interaction) {
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    if (queue.connection.paused) {
      interaction.reply({ content: 'The song is already paused', ephemeral: true });
      return;
    }
    queue.setPaused(true);
    interaction.reply({ content: 'Paused the current song', ephemeral: true });
  }
};