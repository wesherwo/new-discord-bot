const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('watchtogether')
    .setDescription('Starts a youtube watch together activity voice session')
    .addChannelOption(option => option.setName('channel')
      .setDescription('Mention the voice channel. (default: your voice channel)')),
  async execute(client, interaction) {
    const channel = (await interaction.options.getChannel("channel", false)) ?? interaction.member?.voice?.channel;

    if (!channel) {
      interaction.reply({ content: 'You have to join or mention a voice channel', ephemeral: true });
      return;
    }

    if (!channel.viewable) {
      interaction.reply({ content: 'I need **\`VIEW_CHANNEL\`** permission', ephemeral: true });
      return;
    }

    if (channel.type !== "GUILD_VOICE") {
      interaction.reply({ content: 'Provide a valid guild voice channel', ephemeral: true });
      return;
    }

    if (!channel.permissionsFor(interaction.guild.me)?.has(1n)) {
      interaction.reply({ content: 'I need \`Create Invite\` permission.', ephemeral: true });
      return;
    }

    const invite = await channel.createInvite({
      targetApplication: "880218394199220334",
      targetType: 2
    });

    let embed = new MessageEmbed();
    embed.setTitle(`Successfully setup **YouTube Watch Together** activity to **${channel.name}** channel.`);

    const btnRow = new MessageActionRow().addComponents([
      new MessageButton()
      .setLabel("Join")
      .setStyle("LINK")
      .setURL(`${invite.url}`)
      ]);

    return interaction.reply({ embeds: [embed], components: [btnRow] }).catch(console.error);
  }
};