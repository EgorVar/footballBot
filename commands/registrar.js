const bd = require('../database');
const md5 = require('md5');
const phrases = require('./../phrases');
const { registerNotification } = require('../server/sendNotification');
const { isMemberChat } = require('./utils');
const bot = require('../createBot/registrar_bot_registration')

restartFunction();
async function restartFunction() {
    const db = bd.settings();
    const lastRestartChat = db.lastRestartChat;
    if (lastRestartChat != null) {
        await registerNotification(lastRestartChat, "✅️ Робот успешно перезагружен.");
        await bd.settings({ lastRestartChat: null });
    }
}

async function checkPhreases() {
    try {
        delete require.cache[require.resolve("./../phrases")]
        const t = require("./../phrases");
        return true;
    } catch (e) {
        return false;
    }

}

module.exports = async (msg, match) => {
    var group_data = await bd.settings();
    if (!msg.text) {
        return;
    }
    if (msg.text.indexOf("/start") != -1 && msg.text.indexOf("snap_chat") != -1) {
        if (msg.from.id == group_data.main_admin) {
            bd.settings({ moderation_chat: msg.chat.id });
            return;
        }
    } else if (msg.chat.type != 'private') {
        if (msg.text == '/set_chat' && msg.from.id == group_data.main_admin) {
            await bd.settings({ pay_channel_id: msg.chat.id });
            bot.sendMessage(msg.chat.id, phrases.string36);
        } else if (msg.text == "/restart") {
            const success = await checkPhreases();
            if (!success) return bot.sendMessage(msg.chat.id, "⚠️ Перезагрузка невозможна, проверьте phrases.js!");
            await bd.settings({ lastRestartChat: msg.chat.id });
            bot.sendMessage(msg.chat.id, "⚙️ Робот перезагружается..");
            setTimeout(restartFunc, 1500);
            function restartFunc() {
                require('child_process').execSync("pm2 restart 0");
            }
        } else if (msg.text == '/login') {
            bot.sendMessage(msg.from.id, phrases.string37.replace("%%link%%", `${process.env.HOST}:${process.env.PORT}/?login=${md5(`ViPerCent_one_love_${msg.from.id}`)}`));
            bot.sendMessage(msg.chat.id, phrases.string38);
        } else if (msg.text == '/add' && msg.from.id == group_data.main_admin && msg.reply_to_message) {
            if (!group_data.additional_admins[msg.reply_to_message.from.id]) {
                // group_data.additional_admins[msg.reply_to_message.from.id] = { editTeam:false,editChatSettings: false,accessDateBase: false,viewMark: false, editDateBase: false, acceptUser: false, requestRegistration: false };
                group_data.additional_admins[msg.reply_to_message.from.id] = {};
                bd.settings({ additional_admins: group_data.additional_admins });
                bot.sendMessage(msg.chat.id, phrases.string39);
            } else {
                bot.sendMessage(msg.chat.id, phrases.string40);
            }
        } else if (msg.text == '/del' && msg.from.id == group_data.main_admin && msg.reply_to_message) {
            if (group_data.additional_admins[msg.reply_to_message.from.id]) {
                if (msg.from.id != msg.reply_to_message.from.id) {
                    delete group_data.additional_admins[msg.reply_to_message.from.id];
                    bd.settings({ additional_admins: group_data.additional_admins });
                    bot.sendMessage(msg.chat.id, phrases.string41);
                } else {
                    bot.sendMessage(msg.chat.id, phrases.string42_1);
                }
            } else {
                bot.sendMessage(msg.chat.id, phrases.string42);
            }
        }
        return;
    }




    var user_info = await bd.get(`id==${msg.from.id}`);
    if (user_info.length == 0) {
        user_info = await bd.into(msg.from.id, { id: msg.from.id, domain: msg.from.username });
    }
    user_info = user_info[0];

    var user_question = ['last_name', 'first_name', 'patronymic', 'birthdate', 'vk_link', 'phone', 'anketa_how_find', 'anketa_playing', 'anketa_role', 'anketa_hall', 'photo'];
    if (msg.text == "/start") {
        user_info = await bd.set(`id==${msg.from.id}`, `question%=%0`)[0];
    }
    if (msg.text == "/updatePhoto") {
        user_info = await bd.set(`id==${msg.from.id}`, `question%=%8`)[0];
    }
    switch (user_info.question - 1) {
        case -1:
            if (user_info.registrar_type == 0) {
                bot.sendMessage(msg.chat.id, phrases.string43, { reply_markup: { inline_keyboard: [[{ text: phrases.string44, callback_data: 'start_registrar' }]] } });
            } else {
                bot.sendMessage(msg.chat.id, `👋Привет, ${user_info.registrar_type == 3 ? 'твои данные были проверены\n\nДля обновления фото введи /updatePhoto' : 'твои данные проверяются, пожалуйста подожди'}`);
            }
            break;
        case 10:
            bot.sendMessage(msg.chat.id, group_data['question_photo']);
            break;
        case 11:
            bot.sendMessage(msg.chat.id, phrases.string45);
            break;
        default:
            bd.set(`id==${msg.from.id}`, `${user_question[user_info.question - 1]}%=%${msg.text}`);
            bot.sendMessage(msg.chat.id, `\`${msg.text}\`\n${group_data.text_confirmation_information}`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: group_data.save_info, callback_data: 'next' }]] } });
            break;
    }
}