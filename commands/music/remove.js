const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a specific song from the queue')
    .addIntegerOption(option => option.setName('index')
      .setDescription('The song index to remove')
      .setRequired(true)),
  async execute(client, interaction) {
    let index = interaction.options.getNumber("index");
    const queue = client.player.getQueue(interaction.guild.id) - 1;

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;
    if (!music.queueLength(queue, interaction)) return;
    if (!music.queueIndex(index, queue, interaction)) return;

    queue.remove(index);

    interaction.reply({ content: `Removed track \`${index}\``, ephemeral: true });
  }
};