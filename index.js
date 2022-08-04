require('dotenv').config()
const { Intents, Client, Constants } = require('discord.js')
const command = require('./command.js'); 
var client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

client.on('ready', async () => {
	console.log(`The ${process.env.TARGET} bot is online!`);
    client.user.setActivity(process.env.CURRENCY)
	await clearCommands();
	client.channels.cache.get(process.env.LOGCHANNEL).send(`The ${process.env.TARGET} bot is online!`);
})

function addCommand(name, description, opt = []){
	var commands = client.application.commands;
	commands.create({
        name: name,
        description: description,
		options: opt
    })
}
async function clearCommands(){
	var list = await client.api.applications(client.user.id).commands.get()
	list.forEach(e=>{
		client.api.applications(client.user.id).commands(e.id).delete();
	}) 
	addCommand('ping', 'ping => pong');
	addCommand('autoupdate', 'Enable auto update status');
	addCommand('manualupdate', 'Manula update status');
	addCommand('status', 'set bot Status', [{
                name: 'type',
                description:  'Offline or Online',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            }])
	addCommand('info', 'get Crypto info.', [{
                name: 'type',
                description: 'Crypto Type BTC,ETH, etc in UpperCase',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: 'target',
                description: 'Target like USD, EUR, etc',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
            }])
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) {
      return
    }   
	command(interaction, client);
});


client.login(process.env.TOKEN)