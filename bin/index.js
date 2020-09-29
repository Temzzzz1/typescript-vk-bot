"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const { prefix } = require('../config.json');
const fs = require('fs');
const { VKApi, ConsoleLogger, BotsLongPollUpdatesProvider } = require('node-vk-sdk');
const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');
const http = require('http');
//const remind = require('./commands/remind');
const dayjs = require('dayjs');
let api = new VKApi({
    token: process.env.VK_TOKEN,
    logger: new ConsoleLogger()
});
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(__dirname + '/commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
try {
    mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@cluster0.be5s0.mongodb.net/' + process.env.DB_NAME, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });
    console.log('Database connected...');
}
catch (e) {
    console.log(e);
}
// import { Utils } from './utils'
// const utils = new Utils
// utils.parseTimetable()
// utils.runReminder(api)
const updatesProvider = new BotsLongPollUpdatesProvider(api, process.env.VK_GROUP);
console.log('Bot starts...');
updatesProvider.getUpdates((updates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (updates.length == 0)
            return;
        let object = updates[0].object.message;
        let from_id = object.from_id;
        let peer_id = object.peer_id;
        let message = object.text;
        let type = updates[0].type;
        if (type != 'message_new')
            return;
        if (!message.startsWith(prefix))
            return;
        const args = message.slice(prefix.length).trim().split(/ +/);
        const commandName = ((_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // Проверяем и подключаем команду с директории
        const command = client.commands.get(commandName)
            || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
        // Если команда не найдена, сворачиваем все
        if (!command)
            return console.log('Command not found');
        // Если команда только для админов
        if (command.guildOnly && from_id != '199690736') {
            return api.messagesSend({
                peer_id: peer_id,
                message: 'Прости, но эта команда только для Темы!',
                random_id: 0
            });
        }
        try {
            command.execute(api, object, args, client);
        }
        catch (error) {
            console.error(error);
        }
    }
    catch (error) {
        console.log('message_error', updates);
        console.log(error);
    }
}));
http.createServer().listen(process.env.PORT || 5000);
