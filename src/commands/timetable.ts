import { Timetable } from '../timetableClass'

module.exports = {
    name: 'расписание',
    description: 'покажу расписание ТУСУРа',
    logo: "🎓",
    aliases: ['расп', 'р', ' р', ' расписание', 'h'],
    usage: "[дата]",
    fullDescription: "введи эту команду, чтобы получить доступ к расписанию группу. Если не вводить дополнительные параметры, то бот покажет расписание на сегодняшний день. Ты также можешь использовать даты: сегодня, завтра, послезавтра, 23.09, 14.10.2020",
    async execute(api: any, object: any, args: Array<string>) {
        
        const tt = new Timetable(api, args[0], object)
        tt.showTimetable()

    },
};