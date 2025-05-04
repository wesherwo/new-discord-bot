const { getHolidays } = require('./saveData');
const { getMonthNames } = require('./months');

/*
Makes a date with the given month and day
*/
function makeDate(month, day, hour) {
    var date = new Date();
    date.setHours(hour);
    date.setMinutes(1);
    //set the day of the month to the 1st
    //this avoids th situation where the current day is the 31st and the month to be set has less than 31 days
    //if the month has less than 31 days the month will increase and the day will be set to the difference (31 - [days in month])
    date.setDate(1);
    date.setMonth(month - 1);
    date.setDate(day);
    return date;
}
module.exports.makeDate = (month, day, hour) => { return makeDate(month, day, hour); }

/*
Returns true if the holiday name already exists
*/
module.exports.holidayExists = (holiday) => {
    var exists = false;
    var holidays = getHolidays();
    Object.keys(holidays).forEach(holidayName => {
        if(holidayName.toLowerCase().localeCompare(holiday.toLowerCase().trim()) == 0) {
            exists = true;
        }
    });
    return exists;
}

/*
Returns the holiday for the given date
*/
module.exports.getHolidayOnDate = (month, day) => {
    var holidayForDate = 'default';
    //set the given day to midday
    var date = makeDate(month, day, 12);
    var holidays = getHolidays();
    Object.keys(holidays).forEach(holiday => {
        //set the start date to the begining of the day and the end date to the end of the day for comparisions
        var compareStartDate = makeDate(holidays[holiday]['start-month'], holidays[holiday]['start-day'], 1)
        var compareEndDate = makeDate(holidays[holiday]['end-month'], holidays[holiday]['end-day'], 23);

        //increments/decrements the year if the end date comes before the start in the calendar year
        if(compareStartDate.getTime() - compareEndDate.getTime() > 0) {
            //if the given date is after the start date increment the year, else decrement
            if(date.getTime() - compareStartDate.getTime() >= 0) {
                compareEndDate.setFullYear(compareEndDate.getFullYear() + 1);
            } else {
                compareStartDate.setFullYear(compareStartDate.getFullYear() - 1);
            }
        }
        //if the given date is inbetween the start and end date it falls within the holiday
        if((date.getTime() - compareStartDate.getTime() >= 0) && (date.getTime() - compareEndDate.getTime() <= 0)) {
            holidayForDate = holiday;
        }
    });
    return holidayForDate;
}

/*
Sorts holidays by start date
*/
module.exports.sortHolidays = () => {
    var holidays = getHolidays();
    var sortedHolidays = [];
    Object.keys(holidays).forEach(holiday => {
        sortedHolidays.push(holidays[holiday]);
    });
    //sorts on month 1st since the day can only return up to 30 make the month difference at least 31
    //same month will be 0 and different will be 1 or more * 69
    sortedHolidays.sort(function (a, b) { return ((a['start-month'] - b['start-month']) * 69) + a['start-day'] - b['start-day']});
    return sortedHolidays;
}

/*
Returns true if the given date is a start or end date of an existing holiday
*/
module.exports.holidayStartOverlap = (month, day, newHoliday) => {
    var overlap = false;
    var holidays = getHolidays();
    Object.keys(holidays).forEach(holiday => {
        if(newHoliday.localeCompare(holidays[holiday]['name']) != 0 && holidays[holiday]['start-month'] == month && holidays[holiday]['start-day'] == day) {
            overlap = true;
        }
    });
    return overlap;
}

/*
Returns true if the given month has a holiday that starts in it
*/
module.exports.monthHasHoliday = (month) => {
    var hasHoliday = false
    var holidays = getHolidays();
    Object.keys(holidays).forEach(holiday => {
        if(holidays[holiday]['start-month'] == (getMonthNames().indexOf(month) + 1)) {
            hasHoliday = true;
        }
    });
    return hasHoliday;
}