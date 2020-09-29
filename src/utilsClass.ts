// const dayjs = require('dayjs');
// const timetable = require('./commands/timetable')
// const Remind = require('./models/reminds')
// const fs = require('fs')

// export class Utils {

//     parseTimetable() {
//         var schedule = require('node-schedule');
//         console.log('Timetable parser starts...')
//         var rule = new schedule.RecurrenceRule();
//         rule.minute = 1

//         schedule.scheduleJob(rule, async function () {
//             const http = require("https")
//             const url = "https://timetable.tusur.ru/api/v2/raspisanie_vuzov";

//             await http.get(url, (res: any) => {
//                 res.setEncoding("utf8");
//                 let body = "";
//                 res.on("data", (data: string) => {
//                     body += data;
//                 });
//                 res.on("end", () => {
//                     json: Object = JSON.parse(body);
//                     fs.writeFile('./tusur.json', body, function (err: any) {
//                         if (err) throw err;
//                         console.log('Timetable parsed!');
//                     })
//                 })
//             })
//         });
//     }

//     runReminder(api: any) {
//         console.log('Reminder starts...')

//         setInterval(async () => {

//             if (dayjs().day() == 0) return
//             const reminds = await Remind.find({}).lean()
//             reminds.forEach(async (remind: any) => {


//                 if (dayjs(remind.date).unix() <= dayjs().unix()) {
//                     const obj = {
//                         peer_id: remind.peer_id,
//                         groupFromRemind: remind.group_id
//                     }

//                     timetable.execute(api, obj, ['сегодня'])

//                     await Remind.findOneAndUpdate({ peer_id: remind.peer_id }, {
//                         date: dayjs(remind.date)
//                             .add(1, 'day')
//                             .utc().utcOffset(7)
//                             .format()
//                     })
//                 }


//             });
//         }, 30 * 1000);
//     }
// }