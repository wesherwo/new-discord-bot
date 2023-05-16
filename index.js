const fs = require('node:fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require("discord-player");
const { token } = require('./config.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.MessageContent],
});

client.commands = new Collection();
client.player = new Player(client, {
	leaveOnEnd: true,
	leaveOnStop: true,
	leaveOnEmpty: true,
	leaveOnEmptyCooldown: 60000,
	autoSelfDeaf: true,
	initialVolume: 100
});

fs.readdirSync('./commands').forEach(dirs => {
	const commandFiles = fs.readdirSync(`./commands/${dirs}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${dirs}/${file}`);
		client.commands.set(command.data.name, command);
	}
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

client.login(token);