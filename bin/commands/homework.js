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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Homework = require('../models/homeworks');
var utc = require('dayjs/plugin/utc');
const dayjs_1 = __importDefault(require("dayjs"));
module.exports = {
    name: 'дз',
    description: 'покажу домашнее задание беседы',
    logo: "📁",
    usage: "[параметр]",
    aliases: [' дз', 'домашка'],
    fullDescription: "храни все свои напоминания/домашнее задание прямо в беседе! Бот сам удалит" +
        " домашку, когда пройдет время. Основные команды:\n1. !дз -- показать список домашек\n" +
        "2. !дз добавить [дата] [предмет] [описание] -- добавлю в список\n" +
        "3. !дз удалить [предмет] -- удалю из списка\n" +
        "4. !дз изменить [предмет] [описание] -- изменю описание задания",
    execute(api, object, args) {
        return __awaiter(this, void 0, void 0, function* () {
            function firstLetterCaps(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            if (!args.length) {
                // Show HW
                let data = "Домашнее задание:\n\n";
                const homeworks = yield Homework.find({ peer_id: object.peer_id }).lean();
                if (!homeworks.length) {
                    return api.messagesSend({
                        peer_id: object.peer_id,
                        message: "Домашнего задания нет, но ничего, скоро будет",
                        random_id: 0
                    });
                }
                homeworks.forEach((hw) => __awaiter(this, void 0, void 0, function* () {
                    if (dayjs_1.default().isAfter(dayjs_1.default(hw.date), 'day')) {
                        yield Homework.deleteOne({ date: hw.date });
                    }
                    else {
                        data += firstLetterCaps(hw.title) + " | до " +
                            dayjs_1.default(hw.date).format('DD.MM.YYYY') + "\n" + hw.description + "\n\n";
                    }
                }));
                return api.messagesSend({
                    peer_id: object.peer_id,
                    message: data,
                    random_id: 0
                });
            }
            else {
                switch (args[0]) {
                    case 'добавить':
                        dayjs_1.default.extend(utc);
                        var customParseFormat = require('dayjs/plugin/customParseFormat');
                        dayjs_1.default.extend(customParseFormat);
                        let formatedDate = dayjs_1.default(args[1] + ".2020", 'DD.MM.YYYY').format('DD-MM-YYYY');
                        let DATE = dayjs_1.default(args[1] + ".2020", 'DD.MM.YYYY').format('YYYY-MM-DD');
                        if (dayjs_1.default(formatedDate, "DD-MM-YYYY").isValid() == false || !dayjs_1.default().isBefore(dayjs_1.default(DATE))) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Некорректный ввод даты. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            });
                        }
                        let params = args.splice(0, 3);
                        if (!args.length || !params[2]) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Некорректный ввод предмета. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            });
                        }
                        const homeworks = yield Homework.find({ title: params[2].toLowerCase() }).lean();
                        if (homeworks.length) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Такой предмет уже есть. Может дополнишь его? Попробуй \"!дз изменить [название] [текст]\"",
                                random_id: 0
                            });
                        }
                        yield Homework.create({
                            peer_id: object.peer_id,
                            title: params[2].toLowerCase(),
                            description: args.join(' '),
                            date: DATE
                        });
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Задание добавлено до " + dayjs_1.default(DATE, 'YYYY.MM.DD').format('DD.MM.YYYY'),
                            random_id: 0
                        });
                        break;
                    case 'удалить':
                        if (!args[1]) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Некорректное название. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            });
                        }
                        const hw = yield Homework.deleteOne({ title: args[1].toLowerCase() });
                        if (hw.n) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Задание удалено",
                                random_id: 0
                            });
                        }
                        else {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Задание не найдено",
                                random_id: 0
                            });
                        }
                        break;
                    case 'изменить':
                        if (!args[1]) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Некорректное название. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            });
                        }
                        if (!args[2]) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Нельзя изменить на пустое сообщение. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            });
                        }
                        params = args.splice(0, 2);
                        yield Homework.findOneAndUpdate({ title: params[1].toLowerCase() }, {
                            description: args.join(' ')
                        }, (err, doc) => __awaiter(this, void 0, void 0, function* () {
                            if (!doc) {
                                return api.messagesSend({
                                    peer_id: object.peer_id,
                                    message: "Такой задание не найдено. Подробнее о команде \"!инфо дз\"",
                                    random_id: 0
                                });
                            }
                            else {
                                return api.messagesSend({
                                    peer_id: object.peer_id,
                                    message: "Задание изменено :)",
                                    random_id: 0
                                });
                            }
                        }));
                        break;
                    default:
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Похоже ты ввел что-то не то... Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        });
                        break;
                }
            }
        });
    },
};
