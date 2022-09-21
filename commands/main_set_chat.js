const bd = require('../database');
const phrases = require('./../phrases');
const bot = require('../createBot/main_bot_registration')

module.exports = async (msg, match) => {
    var settings = bd.settings();
    if (msg.from.id == settings.main_admin) {
        let link;
        try{
            link = await bot.exportChatInviteLink(msg.chat.id);
        }catch(e){
            bot.sendMessage(msg.chat.id, `Выдайте мне админку.`);
        }
        if(link){
            bd.into_chat(msg.chat.id, msg.chat.title, link);
            setTimeout(() => { bot.deleteMessage(msg.chat.id, msg.message_id); }, 5000);
            bot.sendMessage(msg.chat.id, phrases.string24).then((res) => {
                setTimeout(() => { bot.deleteMessage(res.chat.id, res.message_id); }, 5000);
            });
            return;
        }
    }
}