const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the queue')
    .addIntegerOption(option => option.setName('page')
      .setDescription('The page number of the queue')),
  async execute(client, interaction) {
    let page = (await interaction.options.getNumber("page", false)) ?? 1;

    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.queueLength(queue, interaction)) return;

    const multiple = 10;
    const maxPages = Math.ceil(queue.tracks.length / multiple);

    if (page < 1 || page > maxPages) page = 1;

    const end = page * multiple;
    const start = end - multiple;
    const tracks = queue.tracks.slice(start, end);

    const embed = client.say.baseEmbed(interaction)
      .setDescription(
        `${tracks.map((song, i) =>
          `${start + (++i)} - [${song.title}](${song.url}) ~ [${song.requestedBy.toString()}]`
        ).join("\n")}`
      )
      .setFooter(
        `Page ${page} of ${maxPages} | song ${start + 1} to ${end > queue.tracks.length ? `${queue.tracks.length}` : `${end}`} of ${queue.tracks.length}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      );

    interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
  }
};