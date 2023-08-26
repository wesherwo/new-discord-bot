const { defaultRoleID } = require('../config.json');

module.exports = {
	name: 'guildMemberAdd',
	async execute(client, member) {
		client.guilds.cache.at(0).roles.fetch(defaultRoleID).then(role => member.roles.add(role, 'Set default role'));
	},
};