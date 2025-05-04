const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const { getMonthNames, getDaysInMonth } = require('../../modules/holidayChanger/months');
const { monthHasHoliday, sortHolidays, getHolidayOnDate, holidayStartOverlap } = require('../../modules/holidayChanger/holidays');

const { messageLife, timeoutMsg } = require('../../saveData/holidayChanger/_config.json');

/*
Dropdown for name selection
*/
module.exports.makeNameSelect = (names) => {
    const holidaySelect = new StringSelectMenuBuilder();
    var holidays = sortedHolidays();
    holidays.forEach(holiday => {
        var currName = names[holiday];
        holidaySelect.addOptions(new StringSelectMenuOptionBuilder()
            .setLabel(holiday.name + `(${currName})`)
            .setValue(holiday.name.toLowerCase()));
    });
    return holidaySelect;
}

/*
Text input for name
*/
function makeTextInput(label) {
    const textInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel(label)
        .setStyle(TextInputStyle.Short);
    return textInput;
}
module.exports.makeTextInput = (label) => { return this.makeTextInput(label); }

/*
Submit button
*/
function makeSubmitButton(label) {
    const submitButton = new ButtonBuilder()
        .setCustomId('submit')
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);
    return submitButton;
}
module.exports.makeSubmitButton = (label) => { return this.makeSubmitButton(label); }

/*
Holiday selection
*/
module.exports.holidaySelection = (interaction, actionText, names = null) => {
    return new Promise(async(resolve, reject) => {
        var holiday;

        const message = await interaction.reply({
            content: 'Select a holiday to ' + actionText,
            components: makeHolidaySelection(names),
            ephemeral: true
        });

        // Create a reaction collector
        const collector = message.createMessageComponentCollector({ time: messageLife });

        var buttonClickInteraction;
        collector.on('collect', interaction => {
            if(interaction.customId.startsWith('select-holiday')) {
                // Confirm selection
                holiday = getSelectionValue(interaction, 1, 'holiday-select');
                buttonClickInteraction = interaction;
                collector.stop('holiday-selected');
            } else if(interaction.isModalSubmit()) {
                console.log(interaction);
            } else {
                // Update the message
                var monthSelected = getSelectionValue(interaction, 0, 'month-select');
                var holidaySelected = getSelectionValue(interaction, 1, 'holiday-select');
                // Reset holiday if month is changed
                if(interaction.customId === 'month-select') { holidaySelected = null; }
                interaction.update({
                    content: 'Select a holiday to ' + actionText,
                    components: makeHolidaySelection(names, monthSelected, holidaySelected)
                });
            }
        });
        collector.on('end', (collected, reason) => {
            if(reason.localeCompare('holiday-selected') == 0) {
                if(!names) {
                    resolve(holiday.toLowerCase());
                } else {
                    resolve([holiday.toLowerCase(), buttonClickInteraction]);
                }
            } else {
                interaction.editReply({ content: timeoutMsg, components: [] });
                reject();
            }
        });
    });
}

module.exports.nameModal = (interaction, color = false) => {
    return new Promise(async(resolve, reject) => {
        const nameInput = makeTextInput('name').setRequired(true);
        const name = new ActionRowBuilder()
            .addComponents(nameInput);

        const modal = new ModalBuilder()
            .setCustomId('name')
            .setTitle('Enter a name');

        modal.addComponents(name);

        if(color) {
            const colorTextInput = makeTextInput('color').setCustomId('color').setRequired(true);
            const colorInput = new ActionRowBuilder()
                .addComponents(colorTextInput);
            modal.addComponents(colorInput);
        }

        await interaction.showModal(modal);

        // Get the Modal Submit Interaction that is emitted once the User submits the Modal
        const submitted = await interaction.awaitModalSubmit({
            time: messageLife,
            filter: i => i.user.id === interaction.user.id}).catch(error => {resolve(null)})
            if (submitted) {
                const name = submitted.fields.getTextInputValue('name');
                if(color) {
                    const colorSubmit = submitted.fields.getTextInputValue('color');
                    resolve([name, colorSubmit, submitted]);
                } else {
                    resolve([name, submitted]);
                }
            }
        });
}

/*
Holiday output
*/
module.exports.printHolidays = (interaction, id = null, names = null) => {
    if(sortHolidays().length == 0) {
        interaction.reply({ content: 'Add a holiday first', ephemeral: true });
        return;
    }
    var holidays = sortHolidays();
    var output = '';
    if(id && names['default'] && typeof names['default'] === 'string') { output += `Default - ${names['default']}\n`; }
    else if(id && names['default']) { output += `Default - ${names['default']['name']}\n`; }
    holidays.forEach(holiday => {
        output += holiday['name'];
        if(!id) { output += ` - ${holiday['start-month']}/${holiday['start-day']}-${holiday['end-month']}/${holiday['end-day']}`; }
        if(id && names[holiday['name'].toLowerCase()] && typeof names[holiday['name'].toLowerCase()] === 'string') { output += ` - ${names[holiday['name'].toLowerCase()]}`; }
        else if(id && names[holiday['name'].toLowerCase()]) { output += ` - ${names[holiday['name'].toLowerCase()]['name']}`; }
        output += '\n';
    });
    interaction.reply({ content: output.trim(), ephemeral: true });
}

/*
Creates the four dropdowns for the dates and a submit button
*/
module.exports.makeDateSelectionComponents = (rangeSelection, buttonText, holiday) => {
    var components = [];
    const sm = new ActionRowBuilder().addComponents(makeMonthSelect('startMonth', rangeSelection[0]));
    const sd = new ActionRowBuilder().addComponents(makeDaySelect('startDay', rangeSelection[1], rangeSelection[0]));
    const em = new ActionRowBuilder().addComponents(makeMonthSelect('endMonth', rangeSelection[2]));
    const ed = new ActionRowBuilder().addComponents(makeDaySelect('endDay', rangeSelection[3], rangeSelection[2]));
    components.push(sm, sd, em, ed);

    // Disables the submit button if any of the selections have not been made
    const submitButton = makeSubmitButton(buttonText);
    if(!rangeSelection[0] || !rangeSelection[1] || !rangeSelection[2] || !rangeSelection[3]) { submitButton.setDisabled(true); submitButton.setLabel('Make a Selection'); submitButton.setStyle(ButtonStyle.Secondary); }
    // Disables the submit button if the start or end date fall on an existing start date
    if(holidayStartOverlap(Math.floor(rangeSelection[0] / 2) + 1, rangeSelection[1], holiday)) { submitButton.setDisabled(true); submitButton.setLabel('Start Date Already in use'); submitButton.setStyle(ButtonStyle.Danger); }
    const row = new ActionRowBuilder()
            .addComponents(submitButton);
    components.push(row);
    return components;
}

/*
Creates a selection menu for the month
*/
function makeMonthSelect(customId, selection) {
    const monthSelect = new StringSelectMenuBuilder()
        .setCustomId(customId);
    for(var i = 0; i < 24; i++) {
        var label = '' + getMonthNames()[Math.floor(i / 2)];
        if(i % 2 == 0) { label += ' (1st-15th)'; }
        else { label += ' (16th+)'; }

        var option = new StringSelectMenuOptionBuilder()
            .setLabel(label)
            .setValue('' + i);

        if(selection && selection == i) { option.setDefault(true); }

        monthSelect.addOptions(option);
    }
    return monthSelect;
}

/*
Creates a day selection for a given month
*/
function makeDaySelect(customId, selection, month) {
    var days = getDaysInMonth(parseInt(month) + 1);

    const daySelect = new StringSelectMenuBuilder()
        .setCustomId(customId);

    for(var i = days - 14; i <= days; i++) {
        var day;
        var currentHoliday = getHolidayOnDate(Math.floor(month / 2) + 1, i);

        //add the holiday if there is one for the given day
        if(currentHoliday.localeCompare('default') != 0) { day = i + ' - ' + currentHoliday; }
        else { day = '' + i; }

        var option = new StringSelectMenuOptionBuilder()
            .setLabel('' + day)
            .setValue('' + i);

        if(selection && selection == i) { option.setDefault(true); }

        daySelect.addOptions(option);
    }
    return daySelect;
}

/*
Creates a selection menu for the existing holidays
*/
function makeHolidaySelection(names = null, selectedMonth = null, selectedHoliday = null) {
    var components = [];
    
    //List of months
    const monthSelectDropdown = new StringSelectMenuBuilder()
        .setCustomId('month-select');
    getMonthNames().forEach(month => {
        if(monthHasHoliday(month)) {
            if(!selectedMonth) { selectedMonth = month; }
            var option = new StringSelectMenuOptionBuilder()
                .setLabel(month)
                .setValue(month);
            if(selectedMonth === month) { option.setDefault(true); }
            monthSelectDropdown.addOptions(option);
        }
    });
    const monthSelect = new ActionRowBuilder().addComponents(monthSelectDropdown);
    //List of holidays in selected month
    const holidaySelect = new ActionRowBuilder().addComponents(makeHolidaySelect(selectedMonth, selectedHoliday, names));
    var button = makeSubmitButton('Select Holiday').setCustomId('select-holiday');
    if(!selectedMonth || !selectedHoliday) { button.setDisabled(true); }
    const submitButton = new ActionRowBuilder().addComponents(button);

    components.push(monthSelect, holidaySelect, submitButton);
    return components;
}

/*
Creates a dropdown of holidays for the selected month
*/
function makeHolidaySelect(selectedMonth, selectedHoliday, names) {
    const holidaySelect = new StringSelectMenuBuilder()
        .setCustomId('holiday-select');
    var holidays = sortHolidays();
    holidays.forEach(holiday => {
        if(getMonthNames()[holiday['start-month'] - 1] === selectedMonth) {
            var label = holiday['name'];
            if(names && names[holiday['name'].toLowerCase()] && typeof names[holiday['name'].toLowerCase()] === 'string') { label += ' - ' + names[holiday['name'].toLowerCase()]; }
            else if(names && names[holiday['name'].toLowerCase()]) { label += ' - ' + names[holiday['name'].toLowerCase()]['name']; }
            var option = new StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setValue(holiday['name']);
            if (selectedHoliday === holiday['name']) { option.setDefault(true); }
            holidaySelect.addOptions(option);
        }
    });
    return holidaySelect;
}

/*
Returns the value for the select menu by the customId
*/
function getSelectionValue(interaction, i, customId) {
    var selection;
    if(interaction.customId == customId) { selection = getInteractionValue(interaction); }
    else { selection = getSelectedValue(interaction, i); }
    return selection;
}
module.exports.getSelectionValue = (interaction, i, customId) => { return getSelectionValue(interaction, i, customId); }

/*
Returns the value for the interaction
*/
function getInteractionValue(interaction) {
    return interaction.values[0];
}

/*
Returns the selected value of the string selection component
*/
function getSelectedValue(interaction, i) {
    var value;
    interaction.message.components[i].components[0].data.options.forEach(option => { if(option.default) { value = option.value; }});
    return value;
}
module.exports.getSelectedValue = (interaction, i) => { return getSelectedValue(interaction, i); }
