const { SlashCommandBuilder } = require('@discordjs/builders');
const { Lyrics } = require("@discord-player/extractor");
const lyricsClient = Lyrics.init();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get lyrics for a song')
    .addStringOption(option => option.setName('query').setDescription('The song title to search lyrics')),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const queue = client.player.getQueue(interaction.guild.id);
    const query = interaction.options.getString("query", false) ?? queue?.current?.title;

    if (!query) {
      interaction.reply({ content: 'You forgot to provide the song name', ephemeral: true });
      return;
    }
    const queryFormated = query
      .toLowerCase()
      .replace(/\(lyrics|lyric|official music video|official video hd|official video|audio|official|clip officiel|clip|extended|hq\)/g, "");

    const result = await lyricsClient.search(`${queryFormated}`);

    if (!result || !result.lyrics) {
      interaction.reply({ content: 'No lyrics were found for this song', ephemeral: true });
      return;
    }
    const embed = client.say.baseEmbed(interaction)
      .setTitle(`${query}`)
      .setDescription(`${result.lyrics.slice(0, 4090)}...`);

    return interaction.editReply({ embeds: [embed] }).catch(console.error);
  }
};