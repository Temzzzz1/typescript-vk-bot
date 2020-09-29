"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timetableClass_1 = require("../timetableClass");
module.exports = {
    name: 'запомнить',
    description: 'запомню твою группу',
    logo: "💡",
    usage: "[группа]",
    aliases: [' запомнить'],
    fullDescription: "введи эту команду, чтобы бот запомнил твою группу и у тебя появилась возможность использовать расписание",
    execute(api, object, args) {
        const tt = new timetableClass_1.Timetable(api, args[0], object);
        tt.rememberGroup(args[0]);
    },
};
