const bd = require('../database');
var https = require('https');
var fs = require('fs');
const phrases = require('./../phrases');
const { buttons_links } = require('./keyboards');
const { isMemberChat } = require('./utils');
const bot = require('../createBot/registrar_bot_registration')

module.exports = async (msg, match) => {
    var data = msg.data;
    var bot_settings = await bd.settings();
    var user_info = await bd.get(`id==${msg.from.id}`);
    if (user_info.length == 0) {
        user_info = await bd.into(msg.from.id, { id: msg.from.id, domain: msg.from.username });
    }
    user_info = user_info[0];

    var type_message = ['question_surname', 'question_name', 'question_patronymic', 'question_birthdate', 'question_link', 'question_phone', 'question_anketa_how_find', 'question_anketa_playing', 'question_anketa_role', 'question_anketa_hall', 'question_photo', 'text_successful_passage_registration', 'text_successful_passage_test', 'text_confirmation_information', 'text_erroneous_passage_test', 'text_links_on_chats'];

    if (data.indexOf("answer_") != -1) {
        var question = user_info.test_question;
        var question_id = data.replace("answer_", "");
        question_id = parseInt(question_id) + 1;

        if (bot_settings.answer_control_question[question] != question_id) {
            bd.set(`id==${msg.from.id}`, `test_question%=%0`);
            var rule_text = bot_settings.rules;
            rule_text = rule_text.substring(1, rule_text.indexOf("]("));
            var rule_link = bot_settings.rules;
            rule_link = rule_link.substring(rule_link.indexOf("](") + "](".length, rule_link.indexOf(")"));
            bot.editMessageText(bot_settings['text_erroneous_passage_test'], { chat_id: msg.message.chat.id, message_id: msg.message.message_id, reply_markup: { inline_keyboard: [[{ text: rule_text, url: rule_link }], [{ text: bot_settings.agreement_button, callback_data: 'accept' }]] } });
            return;
        }
        bd.set(`id==${msg.from.id}`, `test_question%=%${++question}`);
        if (question == bot_settings.control_question.length) {
            bd.set(`id==${msg.from.id}`, `test_question%=%0%,%registrar_type%=%3`);
            
            
            bot.editMessageText(bot_settings.text_successful_passage_test, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, reply_markup: { inline_keyboard: [[{ text: `👨‍⚖️ Управсостав`, url: `t.me/${process.env.BOT_USERNAME1}` }]] } });
            return;
        }
        question = bot_settings.control_question[question];
        var board = [];
        question.answer.forEach((item, index) => {
            board.push([{ text: item, callback_data: `answer_${index}` }]);
        })
        bot.editMessageText(question.text, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, reply_markup: { inline_keyboard: board } });
    }

    switch (data) {
        case 'start_registrar':
            bd.set(`id==${msg.from.id}`, `question%=%${user_info.question + 1}`);
            bot.editMessageText(bot_settings['question_surname'], { chat_id: msg.message.chat.id, message_id: msg.message.message_id });
            break;
        case 'next':
            if (user_info.question == 11) {
                var time = new Date();
                time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
                bd.set(`id==${msg.from.id}`, `question%=%0%,%registrar_type%=%1%,%test_question%=%0%,%registration_date%=%${time.getTime()}`);
                bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                bot.sendMessage(msg.message.chat.id, bot_settings['text_successful_passage_registration']);
                if (bot_settings.moderation_chat) {
                    // var text = `[${msg.from.first_name}](tg://user?id=${msg.from.id}) *прошел регистрацию*\n\nФамилия: *${user_info.last_name}*\nИмя: *${user_info.first_name}*\nОтчество: *${user_info.patronymic}*\nДень рождения: *${user_info.birthdate}*\nВКонтакт: *${user_info.vk_link}*\nТелефон: *${user_info.phone}*\n\n[Открыть страницу](${process.env.HOST}:${process.env.PORT}/registrar_user/?id=${msg.from.id})`;
                    var text = phrases.string46.replace("%%name%%", `[${msg.from.first_name}](tg://user?id=${msg.from.id})`).replace("%%surname%%", `${user_info.last_name}`).replace("%%name%%", `${user_info.first_name}`).replace("%%middlename%%", `${user_info.patronymic}`).replace("%%birthday%%", `${user_info.birthdate}`).replace("%%vk%%", `${user_info.vk_link}`).replace("%%phone%%", `${user_info.phone}`).replace("%%anketa_how_find%%", `${user_info.anketa_how_find}`).replace("%%anketa_playing%%", `${user_info.anketa_playing}`).replace("%%anketa_role%%", `${user_info.anketa_role}`).replace("%%anketa_hall%%", `${user_info.anketa_hall}`) + `\n\n[Открыть страницу](${process.env.HOST}:${process.env.PORT}/registrar_user/?id=${msg.from.id})`;
                    try {
                        bot.sendPhoto(bot_settings.moderation_chat, user_info.photo, { caption: text, parse_mode: 'Markdown' })
                        bot.sendDocument(bot_settings.moderation_chat, user_info.photo, { caption: text, parse_mode: 'Markdown' })
                    } catch (e) { }
                }

                var url = await bot.getFile(user_info.photo);
                var file = await fs.createWriteStream(`./database/users_img/${msg.from.id}.jpg`);
                await https.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${url.file_path}`, async (response) => {
                    await response.pipe(file);
                });
                return;
            }
            if (user_info.question == 12) {
                var url = await bot.getFile(user_info.photo);
                await bd.set(`id==${msg.from.id}`, `question%=%0`);
                var file = await fs.createWriteStream(`./database/users_img/${msg.from.id}.jpg`);
                await https.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${url.file_path}`, async (response) => {
                    await response.pipe(file);
                });
                bot.editMessageText(phrases.string47, { chat_id: msg.message.chat.id, message_id: msg.message.message_id });
                return;
            }
            bd.set(`id==${msg.from.id}`, `question%=%${user_info.question + 1}`);
            var text = type_message[user_info.question];
            text = bot_settings[text];
            // %%#Video ChromaKey.mp4#%%
            if (text.indexOf("#Video") != -1) {
                try {
                    var videoText = text.match(/\%\%#Video (.+)#\%\%/)[1];
                    var videoUrl = `./commands/videos/${videoText}`;
                    bot.sendVideo(msg.message.chat.id, fs.createReadStream(videoUrl));
                } catch (e) { };
            }
            text = text.replace(text.slice(text.indexOf("%%"), text.lastIndexOf("%%") + "%%".length), '');
            bot.editMessageText(text, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, disable_web_page_preview: 1 });
            break;

        case 'accept':
            var question = user_info.test_question;
            question = bot_settings.control_question[question];
            var board = [];
            question.answer.forEach((item, index) => {
                board.push([{ text: item, callback_data: `answer_${index}` }]);
            })
            bot.editMessageText(question.text, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, reply_markup: { inline_keyboard: board } });
            break;
    }

    bot.answerCallbackQuery(msg.id);
}