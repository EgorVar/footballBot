const bd = require('../database');
const phrases = require('./../phrases');
const bot = require('../createBot/main_bot_registration')

module.exports = async (msg, match) => {
    var users = await bd.get_chat(msg.chat.id);
    users = users.members;
    msg.new_chat_members = msg.new_chat_members || [];


    await msg.new_chat_members.forEach(async (item) => {
        if (item.is_bot) return;
        var user_info = await bd.get(`id==${item.id}`)[0];
        if (!!user_info && user_info.registrar_type != 3) {
            await bot.sendMessage(msg.chat.id, phrases.string23.replace("%%name%%", `<a href="tg://user?id=${item.id}">${item.first_name}</a>`).replace("%%link%%", `@${process.env.BOT_USERNAME}`), { parse_mode: 'HTML' })
            await bot.unbanChatMember(msg.chat.id, item.id);
            return;
        }
        if (users.indexOf(item.id) == -1) {
            users[users.length] = item.id;
        }
    });

    bd.set_chat(msg.chat.id, { members: users });
}