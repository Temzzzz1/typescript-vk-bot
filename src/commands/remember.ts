import { Timetable } from '../timetableClass'

module.exports = {
    name: 'запомнить',
    description: 'запомню твою группу',
    logo: "💡",
    usage: "[группа]",
    aliases: [' запомнить'],
    fullDescription: "введи эту команду, чтобы бот запомнил твою группу и у тебя появилась возможность использовать расписание",
    execute(api: any, object: any, args: Array<string>) {

        const tt = new Timetable(api, args[0], object)
        tt.rememberGroup(args[0])
    },
};