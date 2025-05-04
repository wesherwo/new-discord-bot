const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getHolidays, setHolidays } = require('../../modules/holidayChanger/saveData');
const { holidayExists, makeDate, sortHolidays, getHolidayOnDate } = require('../../modules/holidayChanger/holidays');
const { makeDateSelectionComponents, getSelectionValue, holidaySelection, printHolidays } = require('../../modules/holidayChanger/messageComponents');
const { getMonthNames, getDaysInMonth } = require('../../modules/holidayChanger/months');

const { messageLife, timeoutMsg } = require('../../saveData/holidayChanger/_config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-range')
		.setDescription('Modify holiday schedule')
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new holiday')
                .addStringOption(option => option.setName('name').setDescription('Creates a new holiday').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edits the date range for a holiday name change'))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a holiday'))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays the added holidays and the date ranges'))
        .addSubcommand(subcommand =>
            subcommand.setName('calender')
                .setDescription('Displays the added holidays as a calender')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'add') {
			addHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'edit') {
			editHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printHolidays(interaction);
		} else if (interaction.options.getSubcommand() == 'calender') {
			printHolidayCalender(interaction);
		}
	},
};

/*
Adds a holiday
*/
async function addHoliday(interaction) {
    var holiday = interaction.options.getString('name');
    var content = `Select a start and end date for ${holiday}`;
    var buttonText = 'Create Holiday';
    var actionText = 'added from'

    if(holidayExists(holiday.toLowerCase().trim())) {
        interaction.reply({ content: 'That holiday already exists', ephemeral: true });
        return;
    }

    const message = await interaction.reply({ content: '...working on it', ephemeral: true });
    dateSelection(interaction, holiday, content, buttonText, actionText);
}

/*
Edits a holiday
*/
async function editHoliday(interaction) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    var buttonText = 'Update Holiday';
    var actionText = 'edit';
    // Select holiday to edit
    holidaySelection(interaction, actionText).then(holiday => {
        var content = 'Select a new start and end date for ' + holiday;
        actionText = 'updated to';

        var holidays = getHolidays();
        var startDay = holidays[holiday]['start-day'];
        var endDay = holidays[holiday]['end-day'];
        var startMonth;
        var endMonth;
        if(startDay < 16) { startMonth = '' + ((holidays[holiday]['start-month'] - 1) * 2); }
        else { startMonth = '' + ((holidays[holiday]['start-month'] - 1) * 2 + 1); }
        if(endDay < 16) { endMonth = '' + ((holidays[holiday]['end-month'] - 1) * 2); }
        else { endMonth = '' + ((holidays[holiday]['end-month'] - 1) * 2 + 1); }
        // Edit holiday date range
        dateSelection(interaction, holiday, content, buttonText, actionText, startMonth, startDay, endMonth, endDay);
    });
}

/*
Removes a holiday
*/
async function removeHoliday(interaction) {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }

    var actionText = 'Delete';
    // Select holiday to delete
    holidaySelection(interaction, actionText).then(holiday => {
        var holidays = getHolidays();
        delete holidays[holiday];
        setHolidays(holidays);
        interaction.editReply({ content: 'Holiday removed', components: [] });
    });
}

/*
Date selection
*/
async function dateSelection(interaction, holiday, content, buttonText, action, startMonth = null, startDay = null, endMonth = null, endDay = null) {
    const message = await interaction.editReply({
        content: content,
        components: makeDateSelectionComponents([startMonth, startDay, endMonth, endDay], buttonText, holiday),
        ephemeral: true
    });

    // Create a interaction collector
    const collector = message.createMessageComponentCollector({ time: messageLife });

    var rangeSelections;

    collector.on('collect', interaction => {
        if(interaction.customId.startsWith('submit')) {
            rangeSelections = getHolidayRangeFromMsg(interaction);
            submitRanges(holiday, rangeSelections);
            collector.stop('submitted');

        // Update the message after any interaction with the dates
        } else {
            rangeSelections = getHolidayRangeFromMsg(interaction);
            // Reset startDay if the startMonth is changed
            if(interaction.customId === 'startMonth') { rangeSelections[1] = null; }

            // Reset endDay if the endMonth is changed
            if(interaction.customId === 'endMonth') { rangeSelections[3] = null; }

            // Update the message
            interaction.update({
                content: content,
                components: makeDateSelectionComponents(rangeSelections, buttonText, holiday)
            });
        }
    });
    collector.on('end', (collected, reason) => {
        if(reason.localeCompare('submitted') == 0) {
            interaction.editReply({ content: `${holiday} has been ${action} ${Math.ceil((parseInt(rangeSelections[0]) + 1) / 2)}/${rangeSelections[1]} to ${Math.ceil((parseInt(rangeSelections[2]) + 1) / 2)}/${rangeSelections[3]}`, components: [] });
        } else { 
            interaction.editReply({ content: timeoutMsg, components: [] });
        }
    });
}

function printHolidayCalender(interaction) {
    var embeds = [];
    let embed = new EmbedBuilder();
    embed.setColor(3447003);
    for (var i = 0; i < 12; i++) {
        embed.setTitle(getMonthNames()[i]);
        embed.setDescription(makeMonthText(i + 1, interaction));
        embeds.push(embed);
        embed = new EmbedBuilder();
        embed.setColor(3447003);
    }
    let currentPage = 0;

    const prevButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary);

    var pageNum = new ButtonBuilder()
        .setCustomId("pages")
        .setLabel("Page 1" + "/12")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder()
        .addComponents(prevButton, pageNum, nextButton);

    interaction.reply({
        embeds: [embeds[0]],
        components: [buttons],
        ephemeral: true
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
            pageNum.setLabel("Page " + (currentPage + 1) + "/12");
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        } else if (interaction.customId === "next") {
            currentPage++;
            if (currentPage >= 12) currentPage = 11;
            let embed = embeds[currentPage];
            pageNum.setLabel("Page " + (currentPage + 1) + "/12");
            interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        }
    });

    collector.on("end", (collected) => { interaction.editReply({ components: [] });});
}

function makeMonthText(month, interaction) {
    var monthArray = [];
    for(var i = 1; i <= getDaysInMonth(month * 2); i++) {
        monthArray.push(i);
    }
    var startDayOfMonth = makeDate(month, 1, 12).getDay();
    var output = '';
    var i = 0;
    for(; i < startDayOfMonth; i++) {
        output += '⠀⠀⠀';
    }
    
    for(; i < monthArray.length + startDayOfMonth; i++) {
        var holidays = getHolidays();
        var holiday = getHolidayOnDate(month, monthArray[i - startDayOfMonth]);
        var day = monthArray[i - startDayOfMonth];
        if(holiday.localeCompare('default') != 0) {
            output += `[**${day}**](https://discord.com/channels/${interaction.channel.id}/${interaction.channel.id} "${holidays[holiday]['name']}")⠀`;
        } else {
            output += monthArray[i - startDayOfMonth] + '⠀';
        }
        if(monthArray[i - startDayOfMonth] < 9) {
            output += '⠀';
        }
        if(i != 0 && (i + 1) % 7 == 0) {
            output += '\n';
        }
    }

    return output;
}

function submitRanges(holiday, range) {
    var holidays = getHolidays();
    var startMonth = Math.floor(range[0] / 2) + 1;
    var startDay = parseInt(range[1]);
    var endMonth = Math.floor(range[2] / 2) + 1;
    var endDay = parseInt(range[3]);
    holidays[holiday.toLowerCase().trim()] = {"name":holiday.trim(),"start-month":startMonth, "start-day":startDay, "end-month":endMonth, "end-day":endDay};
    setHolidays(holidays);
}

function getHolidayRangeFromMsg(interaction) {
    // Get the selected dates
    var startMonth = getSelectionValue(interaction, 0, 'startMonth');
    var startDay = getSelectionValue(interaction, 1, 'startDay');
    var endMonth = getSelectionValue(interaction, 2, 'endMonth');
    var endDay = getSelectionValue(interaction, 3, 'endDay');
    return [startMonth, startDay, endMonth, endDay];
}