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
exports.Timetable = void 0;
const Group = require('./models/groups');
var utc = require('dayjs/plugin/utc');
const dayjs = require('dayjs');
const fs_1 = __importDefault(require("fs"));
class Timetable {
    constructor(api, date, object) {
        this._api = api;
        this._object = object;
        dayjs.extend(utc);
        var customParseFormat = require('dayjs/plugin/customParseFormat');
        dayjs.extend(customParseFormat);
        let formatedDate = dayjs(date + ".2020", 'DD.MM.YYYY').format('DD-MM-YYYY');
        this._DATE = dayjs(date + ".2020", 'DD.MM.YYYY').format('DD.MM.YYYY');
        if (dayjs(formatedDate, "DD.MM.YYYY").isValid() == false) {
            switch (date) {
                case 'сегодня':
                    this._DATE = dayjs().utc().utcOffset(7).format('DD.MM.YYYY');
                    break;
                case 'завтра':
                    this._DATE = dayjs().add(1, 'day').utc().utcOffset(7).format('DD.MM.YYYY');
                    break;
                case 'послезавтра':
                    this._DATE = dayjs().add(2, 'day').utc().utcOffset(7).format('DD.MM.YYYY');
                    break;
                default:
                    this._DATE = dayjs().utc().utcOffset(7).format('DD.MM.YYYY');
                    break;
            }
        }
    }
    showTimetable() {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            if (!this._object.groupFromRemind) {
                id = yield Group.findOne({ user_id: this._object.from_id }).lean();
                if (!id) {
                    return api.messagesSend({
                        peer_id: this._object.peer_id,
                        message: 'Я не нашел группу привязанную к тебе\nПопробуй: !запомнить (группа)',
                        random_id: 0
                    });
                }
            }
            else {
                id = {
                    group_id: this._object.groupFromRemind
                };
            }
            function timetableUtil(teachersArray) {
                let result = [];
                teachersArray.forEach((value) => {
                    result.push(value.name);
                });
                return result.join(', ');
            }
            fs_1.default.readFile("tusur.json", "utf8", (error, data) => __awaiter(this, void 0, void 0, function* () {
                let table = JSON.parse(data);
                let Lessons = "🔶 " + id.group_id + " | " + this._DATE + " 🔶\n\n";
                table.faculties.find((faculty) => {
                    return faculty.groups.find((group) => {
                        if (group.name == id.group_id)
                            group.lessons.find((lesson) => {
                                if (lesson.date.split(',').find((time) => time == this._DATE)) {
                                    Lessons += "🔹 " + lesson.subject + "\n" + lesson.time.start
                                        + " - " + lesson.time.end + " | " + lesson.type + "\n"
                                        + timetableUtil(lesson.audiences) + " | " + timetableUtil(lesson.teachers) + "\n\n";
                                }
                            });
                    });
                });
                this._api.messagesSend({
                    peer_id: this._object.peer_id,
                    message: Lessons,
                    random_id: 0
                });
            }));
        });
    }
    rememberGroup(_group) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_group) {
                return this._api.messagesSend({
                    peer_id: this._object.peer_id,
                    message: 'Что запомнить? Введи группу: !запомнить (группа)',
                    random_id: 0
                });
            }
            else {
                fs_1.default.readFile("tusur.json", "utf8", (error, data) => __awaiter(this, void 0, void 0, function* () {
                    let table = JSON.parse(data);
                    const isGroup = table.faculties.find((faculty) => {
                        return faculty.groups.find((group) => group.name == _group);
                    });
                    if (isGroup) {
                        yield Group.findOneAndUpdate({ user_id: this._object.from_id }, {
                            group_id: _group
                        }, (err, doc) => __awaiter(this, void 0, void 0, function* () {
                            if (!doc) {
                                yield Group.create({
                                    user_id: this._object.from_id,
                                    group_id: _group
                                });
                            }
                        }));
                        return this._api.messagesSend({
                            peer_id: this._object.peer_id,
                            message: 'Твоя группа ' + _group + ' сохранена!',
                            random_id: 0
                        });
                    }
                    else {
                        return this._api.messagesSend({
                            peer_id: this._object.peer_id,
                            message: 'Группа не найдена!',
                            random_id: 0
                        });
                    }
                }));
            }
        });
    }
}
exports.Timetable = Timetable;
