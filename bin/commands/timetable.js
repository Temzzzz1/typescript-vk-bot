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
Object.defineProperty(exports, "__esModule", { value: true });
const timetableClass_1 = require("../timetableClass");
module.exports = {
    name: 'расписание',
    description: 'покажу расписание ТУСУРа',
    logo: "🎓",
    aliases: ['расп', 'р', ' р', ' расписание', 'h'],
    usage: "[дата]",
    fullDescription: "введи эту команду, чтобы получить доступ к расписанию группу. Если не вводить дополнительные параметры, то бот покажет расписание на сегодняшний день. Ты также можешь использовать даты: сегодня, завтра, послезавтра, 23.09, 14.10.2020",
    execute(api, object, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const tt = new timetableClass_1.Timetable(api, args[0], object);
            tt.showTimetable();
        });
    },
};
