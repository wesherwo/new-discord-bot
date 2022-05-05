const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require('./_music.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('filter')
		.setDescription('Filters commands')
		.addSubcommand(subcommand =>
			subcommand.setName('reset')
				.setDescription('Reset all applied filters'))
		.addSubcommand(subcommand =>
			subcommand.setName('show')
				.setDescription('Shows all filters')),
    async execute(client, interaction) {
      const subCmd = interaction.options.getSubcommand();
      const queue = client.player.getQueue(interaction.guild.id);
  
      if (!music.currentlyPlaying(queue, interaction)) return;
      if (!music.modifyQueue(interaction)) return;
  
      const filters = queue.getFiltersEnabled();
  
      if (subCmd === "reset") {
        if (!filters.length) {
          interaction.reply({ content: 'No filter is applied now', ephemeral: true });
          return;
        }  
        queue.setFilters({});
        interaction.reply({ content: 'Removed all applied filters', ephemeral: true });
        return;
        
      } else {
        const enabledFilters = queue.getFiltersDisabled();
        const disabledFilters = queue.getFiltersDisabled();
  
        const enFDes = enabledFilters.map((f) => `**${client.utils.toCapitalize(f)}** --> ✅`).join("\n");
  
        const disFDes = disabledFilters.map((f) => `**${client.utils.toCapitalize(f)}** --> ❌`).join("\n");
  
        const embed = client.say.baseEmbed(interaction)
          .setTitle("All Audio Filters")
          .setDescription(`${enFDes}\n\n${disFDes}`);
  
        return interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }
  };