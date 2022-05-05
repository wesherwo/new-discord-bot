const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seeks to a specific position in the current song')
    .addStringOption(option => option.setName('duration')
      .setDescription('The duration to seek <mm:ss>')
      .setRequired(true)),
  async execute(client, interaction) {
    let timeString = interaction.options.getString("duration");
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    const song = queue.current;

    if (song.live) {
      interaction.reply({ content: "Can't seek this live streaming song", ephemeral: true });
      return;
    }

    if (isNaN(timeString) && !timeString.includes(":")) {
      interaction.reply({ content: 'Provide a valid duration to seek', ephemeral: true });
      return;
    }

    if (!isNaN(timeString)) timeString = `00:${timeString}`;

    const time = client.utils.toMilliseconds(timeString);

    if (!time || isNaN(time) || time > song.durationMS || time < 0) {
      interaction.reply({ content: 'Provide a valid duration to seek', ephemeral: true });
      return;
    }

    queue.seek(time);
    interaction.reply({ content: `Seeked to \`${timeString}\``, ephemeral: true });
  }
};