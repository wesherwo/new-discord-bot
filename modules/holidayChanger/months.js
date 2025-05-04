module.exports.getMonthNames = () => {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'];
}

/*
Returns the number of days in a given month
*/
module.exports.getDaysInMonth = (month) => {
    var days = 0;
    if(month == -1 || (month + 1) % 2 == 0) { days = 15; }
    else {
        //set days to the correct amount given the month
        month = Math.floor(month / 2);
        if(month == 2) {
            var year = (new Date()).getFullYear();
            if(year % 4 == 0) { days = 29; }
            else { days = 28; }
        } else if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) { days = 31; }
        else { days = 30; }
    }
    return days;
}