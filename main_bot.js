const bot = require('./createBot/main_bot_registration')
const bd = require('./database')

const {
    main,
    main_start,
    main_callback,
    main_set_chat,
    main_new_person,
    main_left_person,
    record,
    check_user
} = require('./commands');

// bot.on('message', async (msg) => {
//     if (process.env.DEBUG == "true") {
//         console.log(`[MAIN][ID MSG ${msg.message_id}][FROM ${msg.from.first_name} (${msg.from.id})][CHAT ${msg.chat.id}]: ${msg.text}`);
//     }
// });
// Дополняем базу доменами
bot.on('message', async (msg) => {
    const user_info = await bd.get(`id==${msg.from.id}`);
    if (user_info.length > 0) {
        await bd.set(`id==${msg.from.id}`, `domain%=%${msg.from.username}`);
    }
});

// resetrating()
// async function resetrating(){
    // await bd.set(`id->0`, `rating%=%0`);
    // await bd.set(`id->0`, `games%=%0`);
// }

bot.on('message', main);
bot.on('callback_query', main_callback);
bot.on('new_chat_members', main_new_person);
bot.on('left_chat_member', main_left_person);
bot.onText(/\/start/, main_start);
bot.onText(/\/set_chat/, main_set_chat);

record(bot);
check_user(bot);