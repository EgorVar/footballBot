const bot = require('./createBot/registrar_bot_registration.js')


const {
    registrar,
    registrar_callback,
    registrar_photo,
    registrar_document
} = require('./commands')

// bot.on('message', async (msg) => {
//     if (process.env.DEBUG == "true") {
//         console.log(`[REG][ID MSG ${msg.message_id}][FROM ${msg.from.first_name} (${msg.from.id})][CHAT ${msg.chat.id}]: ${msg.text}`);
//     }
// });
bot.on('message', async (msg) => {
    const user_info = await bd.get(`id==${msg.from.id}`);
    if (user_info.length > 0) {
        await bd.set(`id==${msg.from.id}`, `domain%=%${msg.from.username}`);
    }
});

bot.on('message', registrar);
bot.on('photo', registrar_photo);
bot.on('document', registrar_document);
bot.on('callback_query', registrar_callback);
bot.on("polling_error", (msg) => console.log(msg));