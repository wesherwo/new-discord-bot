const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the queue'),
  execute(client, interaction) {
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    if (queue.tracks.length < 3) {
      interaction.reply({ content: 'Need at least \`3\` songs in the queue to shuffle', ephemeral: true });
      return;
    }
    queue.shuffle();
    interaction.reply({ content: 'Shuffled the queue', ephemeral: true });
  }
};