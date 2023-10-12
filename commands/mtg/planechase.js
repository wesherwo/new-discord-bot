const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const planes = JSON.parse(fs.readFileSync('resources/mtg/planes.json')).planes;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-planechase')
		.setDescription('Run a MTG planechase'),
        
	async execute(client, interaction) {
		startPlanechase(interaction);
	},
};

function startPlanechase(interaction) {
    var embeds = [];
    let embed = new EmbedBuilder();
    embed.setColor(3447003);
    for (var i = 0; i < planes.length; i++) {
        embed.setTitle(planes[i].name);
        embed.setImage(planes[i].image);
        embeds.push(embed);
        embed = new EmbedBuilder();
        embed.setColor(3447003);
    }

    let j, x;
    for (let i = embeds.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = embeds[i];
        embeds[i] = embeds[j];
        embeds[j] = x;
    }

    let currentPage = 0;

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next Plane")
        .setStyle(ButtonStyle.Primary);

    const endGame = new ButtonBuilder()
        .setCustomId("end")
        .setLabel("End Game")
        .setStyle(ButtonStyle.Danger);

    const buttons = new ActionRowBuilder()
        .addComponents(nextButton, endGame);

    interaction.reply({
        embeds: [embeds[0]],
        components: [buttons]
    });

    const collector = interaction.channel.createMessageComponentCollector({
        time: 43200000 //12hr timeout
    });

    collector.on("collect", (interaction) => {
        if (interaction.customId === "next") {
            currentPage++;
            if(currentPage > embeds.length) {
                currentPage = 0;
            }
            interaction.update({
                embeds: [embeds[currentPage]],
                components: [buttons]
            });
        } else if (interaction.customId === "end") {
            collector.stop();
        }
    });

    collector.on("end", (collected) => { interaction.editReply({ components: [] });});
}