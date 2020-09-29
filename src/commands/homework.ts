const Homework = require('../models/homeworks')
var utc = require('dayjs/plugin/utc')
import dayjs from 'dayjs';

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
    async execute(api: any, object: any, args: Array<string>) {

        function firstLetterCaps (str: string): string {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        if (!args.length) {
            // Show HW
            
            let data: string = "Домашнее задание:\n\n"

            const homeworks = await Homework.find({ peer_id: object.peer_id }).lean()


            if (!homeworks.length) {
                return api.messagesSend({
                    peer_id: object.peer_id,
                    message: "Домашнего задания нет, но ничего, скоро будет",
                    random_id: 0
                })
            }

            

            homeworks.forEach(async (hw: any) => {

                if (dayjs().isAfter(dayjs(hw.date), 'day')) {
                    await Homework.deleteOne({ date: hw.date })
                } else {
                    data += firstLetterCaps(hw.title) + " | до " + 
                    dayjs(hw.date).format('DD.MM.YYYY') + "\n" + hw.description + "\n\n"
                }
            })

            return api.messagesSend({
                peer_id: object.peer_id,
                message: data,
                random_id: 0
            })

        } else {
            
            switch (args[0]) {
                case 'добавить':

                    dayjs.extend(utc)
                    var customParseFormat = require('dayjs/plugin/customParseFormat')
                    dayjs.extend(customParseFormat)
                    let formatedDate: string = dayjs(args[1] + ".2020", 'DD.MM.YYYY').format('DD-MM-YYYY')
                    let DATE: string = dayjs(args[1] + ".2020", 'DD.MM.YYYY').format('YYYY-MM-DD')
                    

                    if (dayjs(formatedDate, "DD-MM-YYYY").isValid() == false || !dayjs().isBefore(dayjs(DATE))) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Некорректный ввод даты. Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        })
                    }
                    
                    let params: Array<string> = args.splice(0, 3)

                    if (!args.length || !params[2]) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Некорректный ввод предмета. Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        })
                    }

                    const homeworks = await Homework.find({ title: params[2].toLowerCase() }).lean()

                    if (homeworks.length) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Такой предмет уже есть. Может дополнишь его? Попробуй \"!дз изменить [название] [текст]\"",
                            random_id: 0
                        })
                    }

                    await Homework.create({ 
                        peer_id: object.peer_id,
                        title: params[2].toLowerCase(),
                        description: args.join(' '),
                        date: DATE
                    });

                    return api.messagesSend({
                        peer_id: object.peer_id,
                        message: "Задание добавлено до " + dayjs(DATE, 'YYYY.MM.DD').format('DD.MM.YYYY'),
                        random_id: 0
                    })

                    break;

                case 'удалить':

                    if (!args[1]) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Некорректное название. Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        })
                    } 

                    const hw = await Homework.deleteOne({ title: args[1].toLowerCase() })
                    if (hw.n) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Задание удалено",
                            random_id: 0
                        })
                    } else {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Задание не найдено",
                            random_id: 0
                        })
                    }

                    break;

                case 'изменить':

                    if (!args[1]) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Некорректное название. Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        })
                    } 

                    if (!args[2]) {
                        return api.messagesSend({
                            peer_id: object.peer_id,
                            message: "Нельзя изменить на пустое сообщение. Подробнее о команде \"!инфо дз\"",
                            random_id: 0
                        })
                    } 

                    params = args.splice(0, 2)
                    await Homework.findOneAndUpdate({ title: params[1].toLowerCase() }, {
                        description: args.join(' ')
                    }, async (err: any, doc: any) => {
                        if (!doc) {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Такой задание не найдено. Подробнее о команде \"!инфо дз\"",
                                random_id: 0
                            })
                        } else {
                            return api.messagesSend({
                                peer_id: object.peer_id,
                                message: "Задание изменено :)",
                                random_id: 0
                            })
                        }
                    })
                    


                    break;

                default:
                    return api.messagesSend({
                        peer_id: object.peer_id,
                        message: "Похоже ты ввел что-то не то... Подробнее о команде \"!инфо дз\"",
                        random_id: 0
                    })
                    break;
            }
        }



    },
};