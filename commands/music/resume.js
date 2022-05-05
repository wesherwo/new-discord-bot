const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the current paused song'),
  execute(client, interaction) {
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    if (!queue.connection.paused) {
      interaction.reply({ content: 'The song is not paused', ephemeral: true });
      return;
    }
    queue.setPaused(false);
    interaction.reply({ content: 'Resumed the corrent song', ephemeral: true });
  }
};