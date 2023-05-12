const { SlashCommandBuilder } = require('@discordjs/builders');
const { getHolidays, setHolidays, getSortedHolidays } = require('./_holidayNameChanger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('holiday-range')
		.setDescription('Edit holiday names for a user')
        .addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Adds a new holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('start-month').setDescription('Start month for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('start-day').setDescription('Start day for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('end-month').setDescription('End month for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('end-day').setDescription('End day for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edits the date range for a holiday name change')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('start-month').setDescription('New start month for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('start-day').setDescription('New start day for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('end-month').setDescription('New end month for the name change').setRequired(true))
                .addIntegerOption(option => option.setName('end-day').setDescription('New end day for the name change').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes a holiday')
                .addStringOption(option => option.setName('holiday').setDescription('Holiday to remove').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Displays the added holidays and the date ranges')),
        
	async execute(client, interaction) {
		if (interaction.options.getSubcommand() == 'add') {
			makeHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'edit') {
			editHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'remove') {
			removeHoliday(interaction);
		} else if (interaction.options.getSubcommand() == 'print') {
			printHolidays(interaction);
		}
	},
};

function makeHoliday(interaction) {
    var holidays = getHolidays();
    var newHolidayName = interaction.options.getString('holiday').toLowerCase().trim();
    if(holidays[newHolidayName]) {
        interaction.reply({ content: 'Holiday already exists', ephemeral: true });
        return;
    }

    var startMonth = interaction.options.getInteger('start-month');
    var startDay = interaction.options.getInteger('start-day');
    var endMonth = interaction.options.getInteger('end-month');
    var endDay = interaction.options.getInteger('end-day');
    if (startMonth > 12 || startDay > 31) {
        interaction.reply({ content: 'Start date must be valid', ephemeral: true });
        return;
    }
    if (endMonth > 12 || endDay > 31) {
        interaction.reply({ content: 'End date must be valid', ephemeral: true });
        return;
    }
    var startDate = new Date();
    startDate.setMonth(startMonth - 1);
    startDate.setDate(startDay);

    var endDate = new Date();
    endDate.setMonth(endMonth - 1);
    endDate.setDate(endDay);

    if (startDate.getTime() > endDate.getTime()) {
        interaction.reply({ content: 'Start date must be before end date', ephemeral: true });
        return;
    }

    var overlap = verifyNoDateRangeOverlaps(startDate, endDate, null);
    if(overlap != null) {
        interaction.reply({ content: 'Date range overlaps with ' + overlap, ephemeral: true });
        return;
    }

    holidays[newHolidayName] = {"name":interaction.options.getString('holiday'),"start-month":startMonth,"start-day":startDay,"end-month":endMonth,"end-day":endDay};
    setHolidays(holidays);
    interaction.reply({ content: 'Holiday created', ephemeral: true });
}

function editHoliday(interaction) {
    var holidays = getHolidays();
    var newHolidayName = interaction.options.getString('holiday').toLowerCase().trim();
    if(!holidays[newHolidayName]) {
        interaction.reply({ content: 'Holiday does not exist', ephemeral: true });
        return;
    }

    var startMonth = interaction.options.getInteger('start-month');
    var startDay = interaction.options.getInteger('start-day');
    var endMonth = interaction.options.getInteger('end-month');
    var endDay = interaction.options.getInteger('end-day');
    if (startMonth > 12 || startDay > 31) {
        interaction.reply({ content: 'Start date must be valid', ephemeral: true });
        return;
    }
    if (endMonth > 12 || endDay > 31) {
        interaction.reply({ content: 'End date must be valid', ephemeral: true });
        return;
    }
    var startDate = new Date();
    startDate.setMonth(startMonth - 1);
    startDate.setDate(startDay);

    var endDate = new Date();
    endDate.setMonth(endMonth - 1);
    endDate.setDate(endDay);

    if (startDate.getTime() > endDate.getTime()) {
        interaction.reply({ content: 'Start date must be before end date', ephemeral: true });
        return;
    }

    var overlap = verifyNoDateRangeOverlaps(startDate, endDate, interaction.options.getString('holiday'));
    if(overlap != null) {
        interaction.reply({ content: 'Date range overlaps with ' + overlap, ephemeral: true });
        return;
    }

    var holidays = getHolidays();
    holidays[newHolidayName] = {"name":interaction.options.getString('holiday'),"start-month":startMonth,"start-day":startDay,"end-month":endMonth,"end-day":endDay};
    setHolidays(holidays);
    interaction.reply({ content: 'Holiday range changed', ephemeral: true });
}

function printHolidays(interaction) {
    var holidays = getSortedHolidays();
    var output = '';
    holidays.forEach(holiday => {
        output += holiday['name'] + ' - ' + holiday['start-month'] + '/' + holiday['start-day'] + '-' + holiday['end-month'] + '/' + holiday['end-day'] + '\n';
    });
    interaction.reply({ content: output.trim()});
}

function removeHoliday(interaction) {
    var holidays = getHolidays();
    var newHolidayName = interaction.options.getString('holiday').toLowerCase().trim();
    if(!holidays[newHolidayName]) {
        interaction.reply({ content: 'Holiday does not exist', ephemeral: true });
        return;
    }
    delete holidays[newHolidayName];
    setHolidays(holidays);
    interaction.reply({ content: 'Holiday removed', ephemeral: true });
}

function verifyNoDateRangeOverlaps(startDate, endDate, name) {
    var conflict = null;
    var holidays = getHolidays();
    if(startDate.getTime() - endDate.getTime() > 0) {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    Object.keys(holidays).forEach(holiday => {
        if(!name || holiday.toLowerCase().trim().localeCompare(name.toLowerCase().trim()) != 0) {
            var compareStartDate = new Date();
            compareStartDate.setMonth(holidays[holiday]['start-month'] - 1);
            compareStartDate.setDate(holidays[holiday]['start-day']);

            var compareEndDate = new Date();
            compareEndDate.setMonth(holidays[holiday]['end-month'] - 1);
            compareEndDate.setDate(holidays[holiday]['end-day']);

            if(compareStartDate.getTime() - compareEndDate.getTime() > 0) {
                compareEndDate.setFullYear(compareEndDate.getFullYear() + 1);
            }

            if(((startDate.getTime() - compareStartDate.getTime() >= 0) && (startDate.getTime() - compareEndDate.getTime() <= 0)) 
                    || ((endDate.getTime() - compareStartDate.getTime() >= 0) && (endDate.getTime() - compareEndDate.getTime() <= 0))) {
                conflict = holiday;
            }
        }
    });
    return conflict;
}