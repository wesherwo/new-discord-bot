module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.commands.each( command => {
			if (typeof command.startup !== "undefined") {
				command.startup(client);
			}
		});
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};