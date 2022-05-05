const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls some dice')
        .addStringOption(option => option.setName('dice').setDescription('Format is xDy+z').setRequired(true)),
	async execute(client, interaction) {
		var roll = 0;
        var arr = interaction.options.getString('dice').split('+');
        var rolls = '';
        var currRoll = 0;
        try {
            arr.forEach(element => {
                var split = element.toLowerCase().indexOf('d');
                if(split >= 0) {
                    var dice = parseInt(element.substring(0,split).trim());
                    var sides = parseInt(element.substring(split + 1).trim());
                    for(var i = 0; i < dice; i++) {
                        currRoll = Math.floor(Math.random() * sides) + 1
                        roll += currRoll;
                        if(currRoll == 1 || currRoll == sides) {
                            rolls = rolls.concat('__**' + currRoll + '**__, ');
                        } else {
                            rolls = rolls.concat(currRoll + ', ');
                        }
                    }
                } else {
                    roll += parseInt(element.trim());
                }
            });
        } catch (error) {
            interaction.reply({ content: 'Format must be xDy+z.', ephemeral: true });
            return;
        }
        interaction.reply('You rolled a ' + roll + '\n\n' + rolls.substring(0, rolls.length-2));
	    },
};