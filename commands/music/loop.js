const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueueRepeatMode } = require("discord-player");
const music = require('./_music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Change the loop mode (autoplay|track|queue|off)')
    .addSubcommand(subcommand =>
      subcommand.setName('mode')
        .setDescription('Shows current set loop mode'))
    .addSubcommand(subcommand =>
      subcommand.setName('off')
        .setDescription('Turn the looping off'))
    .addSubcommand(subcommand =>
      subcommand.setName('queue')
        .setDescription('Loop the queue (all songs)'))
    .addSubcommand(subcommand =>
      subcommand.setName('track')
        .setDescription('Repeat the current song'))
    .addSubcommand(subcommand =>
      subcommand.setName('autoplay')
        .setDescription('Autoplay related songs after queue end')),
  async execute(client, interaction) {
    const subCmd = interaction.options.getSubcommand();
    const queue = client.player.getQueue(interaction.guild.id);

    if (!music.currentlyPlaying(queue, interaction)) return;
    if (!music.modifyQueue(interaction)) return;

    let mode;
    switch (subCmd) {
      case "off":
        queue.setRepeatMode(QueueRepeatMode.OFF);
        mode = "Turned off loop mode.";
        break;
      case "track":
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        mode = "Repeating track activated";
        break;
      case "queue":
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        mode = "Looping queue enabled.";
        break;
      case "autoplay":
        queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        mode = "Autoplay mode activated.";
        break;
      default:
        let md = "none";
        if (queue.repeatMode === 3) {
          md = "autoplay";
        } else if (queue.repeatMode == 2) {
          md = "queue";
        } else if (queue.repeatMode == 1) {
          md = "track";
        } else if (queue.repeatMode == 0) {
          md = "off";
        }

        const embed = client.say.baseEmbed(interaction)
          .setDescription(`Loop mode is set to: \`${md}\`.`)
          .setFooter(`Use \'\/loop <off|track|queue|autoplay>\' to change loop mode.`);
        return interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
    }

    interaction.reply({ content: `Set to ${mode}`, ephemeral: true });
  }
};