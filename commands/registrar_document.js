const bd = require('../database');
const phrases = require('./../phrases');
const bot = require('../createBot/registrar_bot_registration')

module.exports = async (msg, match) => {
    var user_info = await bd.get(`id==${msg.from.id}`);
    if (user_info.length == 0) {
        user_info = await bd.into(msg.from.id, { id: msg.from.id });
    }
    user_info = user_info[0];

    if (user_info.question != 11 && user_info.question != 12 && msg.chat.type == 'private') {
        bot.sendMessage(msg.chat.id, phrases.string48);
        return;
    }
    if (user_info.question == 12 && user_info.registrar_type != 7) {
        await bd.set(`id==${msg.from.id}`, `question%=%0`);
        bot.sendMessage(msg.from.id, phrases.string49);
        return;
    }
    if (msg.chat.type == 'private') {
        await bd.set(`id==${msg.from.id}`, `photo%=%${msg.document.file_id}`);
        await bot.sendMessage(msg.from.id, phrases.string50, { reply_markup: { inline_keyboard: [[{ text: phrases.string51, callback_data: 'next' }]] } });
    }
}