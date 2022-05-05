const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Jump to a specific track in the queue')
    .addIntegerOption(option => option.setName('index')
      .setDescription('The song index to jump to')
      .setRequired(true)),
  async execute(client, interaction) {
    let index = interaction.options.getInteger("index") - 1;

    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;
    if (!music.queueLength(queue, interaction)) return;
    if (!music.queueIndex(index, queue, interaction)) return;

    queue.jump(index);

    interaction.reply({ content: `Jumped to song \`${index}\``, ephemeral: true });
  }
};