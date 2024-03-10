import config from './config.json' assert {type: 'json'};
import fs from 'fs';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildInvites], partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildMember ]});

const events = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (let event of events) {
	const thisEventFile = await import(`#events/${event}`);
	if (thisEventFile.once) {
		client.once(thisEventFile.name, (...args) => {
			thisEventFile.invoke(...args);
		});
	} else {
		client.on(thisEventFile.name, (...args) => {
			thisEventFile.invoke(...args);
		})
	}
}

process.on("unhandledRejection", e => { 
	console.log(e)
}) 
process.on("uncaughtException", e => { 
	console.log(e)
})  
process.on("uncaughtExceptionMonitor", e => { 
	console.log(e)
})

client.login(config.client['TOKEN']);
