const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Check or change the volume')
    .addIntegerOption(option => option.setName('amount')
      .setDescription("Changes the client's output volume")),
  async execute(client, interaction) {
    const newVol = interaction.options.getNumber("amount");
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    if (!newVol) {
      const embed = client.say.baseEmbed(interaction)
        .setDescription(`Volume is at \`${queue.volume}%\`.`)
        .setFooter(`Use \'\/volume <1-200>\' to change the volume.`);

      return interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
    }

    if (!Number.isInteger(newVol) || newVol > 200 || newVol < 0) {
      interaction.reply({ content: 'Provide a valid number between 1 to 200', ephemeral: true });
      return;
    }

    queue.setVolume(newVol);
    interaction.reply({ content: `Volume is updated to \`${queue.volume}%\``, ephemeral: true });
  }
};