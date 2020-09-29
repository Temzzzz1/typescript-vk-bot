require('dotenv').config()

const { prefix } = require('../config.json');
const fs = require('fs');
const {VKApi, ConsoleLogger, BotsLongPollUpdatesProvider} = require('node-vk-sdk')
const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose')
const http = require('http');
//const remind = require('./commands/remind');
const dayjs = require('dayjs');

let api = new VKApi({
    token: process.env.VK_TOKEN,
    logger: new ConsoleLogger()
})

client.commands = new Discord.Collection();   

const commandFiles = fs.readdirSync(__dirname + '/commands').filter( (file: any) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

try {
    mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.be5s0.mongodb.net/'+process.env.DB_NAME, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    console.log('Database connected...')
} catch (e) {
    console.log(e)
}

interface Command  {
    name: string,
    description: string,
    aliases?: Array<string>,
    guildOnly?: boolean,
    logo?: string,
    fullDescription?: string,
    usage?: string, 
    execute(api: any, object: object, args: Array<string>, client: object): any
}

// import { Utils } from './utils'
// const utils = new Utils

// utils.parseTimetable()
// utils.runReminder(api)

const updatesProvider = new BotsLongPollUpdatesProvider(api, process.env.VK_GROUP)
console.log('Bot starts...')

updatesProvider.getUpdates(async (updates: any) => {

    try {
        
        if (updates.length == 0) return

        let object = updates[0].object.message
        let from_id: string = object.from_id
        let peer_id: string = object.peer_id
        let message: string = object.text
        let type: string = updates[0].type

        if (type != 'message_new') return

        if (!message.startsWith(prefix)) return;

        const args: Array<string> = message.slice(prefix.length).trim().split(/ +/)
        const commandName: string = args?.shift()?.toLowerCase() || ''
        
        // Проверяем и подключаем команду с директории
	    const command: Command = client.commands.get(commandName)
                || client.commands.find( (cmd: any) => cmd.aliases && cmd.aliases.includes(commandName));

        // Если команда не найдена, сворачиваем все
        if (!command) return console.log('Command not found');

        // Если команда только для админов
        if (command.guildOnly && from_id != '199690736') {
            return api.messagesSend({
                        peer_id: peer_id,
                        message: 'Прости, но эта команда только для Темы!',
                        random_id: 0
                    })
        }

        try {
            command.execute(api, object, args, client);
        } catch (error) {
            console.error(error);
        }

    } catch (error) {
        console.log('message_error', updates)
        console.log(error)
    }
})

http.createServer().listen(process.env.PORT || 5000)