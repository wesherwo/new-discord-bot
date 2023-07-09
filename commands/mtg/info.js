const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getSets } = require('./_mtg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mtg-info')
		.setDescription('Displays info for Magic the Gathering')
        .addSubcommand(subcommand =>
			subcommand.setName('sets')
				.setDescription('Displays the sets in MTG')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'sets') {
			displaySets(interaction);
		}
	},
};

function displaySets(interaction) {
    var sets = getSets();
    var setData = [];
    for(var i in sets) {
        if(!sets[i]['releasedate']) {
            setData.push({'name': i, 'longname': sets[i]['longname'], 'releasedate': '1970-1-1'});
        } else {
            setData.push({'name': i, 'longname': sets[i]['longname'], 'releasedate': sets[i]['releasedate']});
        }
    }
    setData.sort(function (a, b) {
        var d1 = new Date(a['releasedate']);
        var d2 = new Date(b['releasedate']);
        return d2.getTime() - d1.getTime();
    });

    var totalPages = Math.ceil(setData.length / 20);
    var embeds = [];
    let embed = new EmbedBuilder();
    var fields = 0;
    embed.setColor(3447003).setTitle("Magic sets");
    for (var i = 0; i < setData.length; i++) {
        embed.addFields({name: setData[i]['longname'], value: setData[i]['name'] + " - " + setData[i]['releasedate']});
        fields++;
        if ((fields % 20 == 0 || i == setData.length - 1) && fields > 0) {
            embeds.push(embed);
            embed = new EmbedBuilder();
            embed.setColor(3447003).setTitle("Magic sets");
            fields = 0;
        }
    }

    let currentPage = 0;

    const prevButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:1081828598433992825>")
        .setStyle(ButtonStyle.Primary);

    var pageNum = new ButtonBuilder()
        .setCustomId("pages")
        .setLabel("Page 1" + "/" + totalPages)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:next:1081828596844339251>")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder()
        .addComponents(prevButton, pageNum, nextButton);

    interaction.reply({
        embeds: [embeds[0]],
        components: [buttons]
    });

    const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000, // 5 minute timeout
    });

    collector.on("collect", (interaction) => {
        if (interaction.customId === "previous") {
            currentPage--;
            if (currentPage < 0) currentPage = 0;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + totalPages);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        } else if (interaction.customId === "next") {
            currentPage++;
            if (currentPage >= totalPages) currentPage = totalPages - 1;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/" + totalPages);
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        }
    });

    collector.on("end", (collected) => { interaction.editReply({ components: [] });});
}