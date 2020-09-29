const Group = require('./models/groups')
var utc = require('dayjs/plugin/utc')
const dayjs = require('dayjs')
import fs from 'fs'


export class Timetable {

    private _api: any
    private _DATE: string
    private _object: any

    constructor(api: any, date: string, object: any) {
        this._api = api
        this._object = object

        dayjs.extend(utc)
        var customParseFormat = require('dayjs/plugin/customParseFormat')
        dayjs.extend(customParseFormat)
        let formatedDate: string = dayjs(date + ".2020", 'DD.MM.YYYY').format('DD-MM-YYYY')
        this._DATE = dayjs(date + ".2020", 'DD.MM.YYYY').format('DD.MM.YYYY')
        
        if (dayjs(formatedDate, "DD.MM.YYYY").isValid() == false) {
            switch (date) {
                case 'сегодня':
                    this._DATE = dayjs().utc().utcOffset(7).format('DD.MM.YYYY')
                    break;
                case 'завтра':
                    this._DATE = dayjs().add(1, 'day').utc().utcOffset(7).format('DD.MM.YYYY')
                    break;

                case 'послезавтра':
                    this._DATE = dayjs().add(2, 'day').utc().utcOffset(7).format('DD.MM.YYYY')
                    break;

                default:
                    this._DATE = dayjs().utc().utcOffset(7).format('DD.MM.YYYY')
                    break;
            }
        }
    }

    async showTimetable() {

        let id: any
        if (!this._object.groupFromRemind) {
            id = await Group.findOne({ user_id: this._object.from_id }).lean()
            if (!id) {
                return api.messagesSend({
                    peer_id: this._object.peer_id,
                    message: 'Я не нашел группу привязанную к тебе\nПопробуй: !запомнить (группа)',
                    random_id: 0
                })
            }
        } else {
            id = {
                group_id: this._object.groupFromRemind
            }
        }

        function timetableUtil(teachersArray: Array<string>) {
            let result: Array<string> = []
            teachersArray.forEach((value: any) => {
                result.push(value.name)
            })

            return result.join(', ')
        }

        fs.readFile("tusur.json", "utf8", async (error: any, data: any) => {
            let table: any = JSON.parse(data)
            let Lessons: string = "🔶 " + id.group_id + " | " + this._DATE + " 🔶\n\n"

            table.faculties.find((faculty: any) => {
                return faculty.groups.find((group: any) => {
                    if (group.name == id.group_id)
                        group.lessons.find((lesson: any) => {

                            if (lesson.date.split(',').find((time: any) => time == this._DATE)) {

                                Lessons += "🔹 " + lesson.subject + "\n" + lesson.time.start
                                    + " - " + lesson.time.end + " | " + lesson.type + "\n"
                                    + timetableUtil(lesson.audiences) + " | " + timetableUtil(lesson.teachers) + "\n\n"
                            }
                        })
                })
            })

            this._api.messagesSend({
                peer_id: this._object.peer_id,
                message: Lessons,
                random_id: 0
            })

        })
    }

    async rememberGroup(_group: string) {

        if (!_group) {
            return this._api.messagesSend({
                peer_id: this._object.peer_id,
                message: 'Что запомнить? Введи группу: !запомнить (группа)',
                random_id: 0
            })
        } else {
            fs.readFile("tusur.json", "utf8", async (error: any, data: any) => {
                let table: any = JSON.parse(data)
                const isGroup = table.faculties.find((faculty: any) => {
                    return faculty.groups.find((group: any) => group.name == _group)
                })

                if (isGroup) {
                    await Group.findOneAndUpdate({ user_id: this._object.from_id }, {
                        group_id: _group
                    }, async (err: any, doc: any) => {

                        if (!doc) {
                            await Group.create({ 
                                user_id: this._object.from_id,
                                group_id: _group
                            });
                        }
                    })
                    
                    return this._api.messagesSend({
                        peer_id: this._object.peer_id,
                        message: 'Твоя группа ' + _group + ' сохранена!',
                        random_id: 0
                    })
                } else {
                    return this._api.messagesSend({
                        peer_id: this._object.peer_id,
                        message: 'Группа не найдена!',
                        random_id: 0
                    })
                }
                
            })
        }
    }



}