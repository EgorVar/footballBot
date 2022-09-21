const bd = require('../database');
const list = require('./record_list');
const keyboard = require('./record_keyboard');
const phrases = require('./../phrases');
const moment = require('moment'); moment.locale('ru');
const { isMemberChat } = require('./utils');

const bot = require('../createBot/main_bot_registration')

module.exports = async (msg, match) => {
    const isMember = await isMemberChat(msg);
    // if(!isMember)return bot.answerCallbackQuery(msg.id, { text: phrases.string69, show_alert: true });

    var user = await bd.get(`id==${msg.from.id}`);
    if (user.length == 0) {
        user = await bd.into(msg.from.id, { id: msg.from.id });
    }
    user = user[0];

    if (user.registrar_type != 3) {
        bot.answerCallbackQuery(msg.id, { text: `${phrases.string2.replace("%%link%%", "https://t.me/" + process.env.BOT_USERNAME)}`, show_alert: true });
        return;
    }
    if (msg.data.indexOf("paid_") !== -1) {
        var chat_id = msg.data.substring(msg.data.indexOf("paid_") + "paid_".length);
        chat_id = parseInt(chat_id);
        if (user[`${chat_id}_play`] !== 2 || user[`${chat_id}_go`] !== 1) {
            bot.answerCallbackQuery(msg.id, { text: `${phrases.string3.replace("%%name%%", msg.from.first_name)}`, show_alert: true });
            return;
        }
        if (user[`${chat_id}_paid`]) {
            bot.answerCallbackQuery(msg.id, { text: `${msg.from.first_name} ты уже оплатил)`, show_alert: true });
            return;
        }

        await bd.set(`id==${msg.from.id}`, `${chat_id}_paid%=%true`);

        var chat_info = await bd.get_chat(chat_id);
        bot.editMessageText(phrases.string4, { chat_id: msg.message.chat.id, message_id: msg.message.message_id });
        bot.editMessageText(`${chat_info.stage == 'start' ? chat_info.text_record_start : chat_info.text_record_end}\n\n${await list(chat_info)}`, { chat_id: chat_info.id, message_id: chat_info.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chat_info) });
        if (chat_info.stage == 'paid') {
            bot.sendMessage(chat_info.id, `${chat_info.text_change_list}\n\n[${user.last_name} ${user.first_name}](tg://user?id=${user.id}) идёт на игру.`, { parse_mode: 'Markdown' });
        }
        return;
    }
    if (msg.data.indexOf('team_number') !== -1) {
        var team_number = msg.data.substring(msg.data.indexOf('team_number_') + 'team_number_'.length);
        team_number = parseInt(team_number);

        var settings = bd.settings();
        await settings.teams.forEach(async (team, index) => {
            var points = index == team_number ? 5 : 1;
            await team.forEach(async player => {
                var user_info = await bd.get(`id==${player.id}`)[0];
                user_info.rating += points;
                await bd.set(`id==${player.id}`, `rating%=%${user_info.rating}`);
            })
        })

        await bot.editMessageText(phrases.string5.replace("%%team%%", team_number + 1), { chat_id: msg.message.chat.id, message_id: msg.message.message_id, parse_mode: 'Markdown' })
        return;
    }
    switch (msg.data) {
        case 'empty':
            bot.answerCallbackQuery(msg.id, {
                text: `🔗 Кликните по любой ссылке ниже.`,
                show_alert: true
            });
            break;
        case 'go':
            var chat_settings = await bd.get_chat(msg.message.chat.id);
            if (user[`${msg.message.chat.id}_ban_until`] >= Date.now()) {
                bot.answerCallbackQuery(msg.id, { text: `Грустно, что ты бываешь очень занят и у тебя нет даже 3-х секунд на ответ. Блокировка будет снята, и ты сможешь принять участие в записи с ` + moment(user[`${msg.message.chat.id}_ban_until`]).format("DD.MM.YYYY HH:mm"), show_alert: true });
                return;
            }

            if (user[`${msg.message.chat.id}_go`] == 1) {
                bot.answerCallbackQuery(msg.id, { text: phrases.string6, show_alert: true });
                return;
            }

            if (user[`${msg.message.chat.id}_go_attempt`] > 0 && user[`${msg.message.chat.id}_base`] != true) {
                bot.answerCallbackQuery(msg.id, { text: phrases.string7, show_alert: true });
                return;
            }

            var time = new Date();
            if (chat_settings.stage != 'start') user[`${msg.message.chat.id}_go_attempt`]++;
            time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
            bd.set(`id==${msg.from.id}`, `${msg.message.chat.id}_go%=%1%,%${msg.message.chat.id}_time%=%${time.getTime()}%,%${msg.message.chat.id}_go_attempt%=%${user[`${msg.message.chat.id}_go_attempt`]}`);
            if (chat_settings.stage == 'paid') {
                bot.sendMessage(msg.message.chat.id, `${chat_settings.text_change_list}\n\n[${user.last_name} ${user.first_name}](tg://user?id=${user.id}) планирует пойти на игру.`, { parse_mode: 'Markdown' });

                if(!chat_settings.base.includes(msg.from.id))
                    try {
                        if(chat_settings.paid_online)
                            await bot.sendMessage(msg.from.id, `Оплата принимается автоматически, переходи по ссылке и оплачивай, у тебя есть 1 час времени.\n\n[${chat_settings.paid_online ? "🖥 🌐₽" : "💳"} Оплатить игру](${process.env.HOST}:${process.env.PORT}/pay/${msg.from.id}/${msg.message.chat.id})`, { parse_mode: 'Markdown' })
                            .then(() => {
                                bot.answerCallbackQuery(msg.id, { text: phrases.string21, show_alert: true });
                            })
                        else
                            await bot.sendMessage(msg.from.id, phrases.string16, { reply_markup: { inline_keyboard: [[{ text: phrases.string17, callback_data: `paid_${msg.message.chat.id}` }]] } })
                                .then(() => {
                                    bot.answerCallbackQuery(msg.id, { text: phrases.string18, show_alert: true });
                                })
                                .catch(() => {
                                    bot.answerCallbackQuery(msg.id, { text: phrases.string19, show_alert: true });
                                })
                    } catch (error) {
                        console.log("Blin blyat'");
                        console.log(error);
                        // await bot.sendMessage(msg.message.chat.id, `⛔️ У пользователя ${msg.from.id} заблокирован бот Управсостава.`, { parse_mode: 'HTML' });
                    }
            }
            bot.editMessageText(`${chat_settings.stage == 'start' ? chat_settings.text_record_start : chat_settings.stage == 'end' ? chat_settings.text_record_end : chat_settings.text_pay}\n\n${await list(chat_settings)}`, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chat_settings) });
            bot.answerCallbackQuery(msg.id, {
                text: `${phrases.string8}\n${(user[`${msg.message.chat.id}_base`] || user[`${msg.message.chat.id}_paid`]) ? '' : chat_settings.paid_online ? phrases.string9 : phrases.string10}.`,
                show_alert: true
            });
            break;
        case 'no_go':
            if (user[`${msg.message.chat.id}_ban_until`] >= Date.now()) {
                bot.answerCallbackQuery(msg.id, { text: `Грустно, что ты бываешь очень занят и у тебя нет даже 3-х секунд на ответ. Блокировка будет снята, и ты сможешь принять участие в записи с ` + moment(user[`${msg.message.chat.id}_ban_until`]).format("DD.MM.YYYY HH:mm"), show_alert: true });
                return;
            }

            if (user[`${msg.message.chat.id}_go`] == 0) {
                bot.answerCallbackQuery(msg.id, { text: phrases.string11, show_alert: true });
                return;
            }


            var time = new Date();
            time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
            if (time.getTime() - user[`${msg.message.chat.id}_lastClick`] >= 10000) {
                bd.set(`id==${msg.from.id}`, `${msg.message.chat.id}_lastClick%=%${time.getTime()}`);
                bot.answerCallbackQuery(msg.id, { text: phrases.string12, show_alert: true });
                return;
            }

            var chat_settings = await bd.get_chat(msg.message.chat.id);
            bd.set(`id==${msg.from.id}`, `${msg.message.chat.id}_go%=%0%,%${msg.message.chat.id}_play%=%0%,%${msg.message.chat.id}_time%=%${time.getTime()}%,%${msg.message.chat.id}_lastClick%=%0`);
            if (chat_settings.stage == 'paid') {
                bot.sendMessage(msg.message.chat.id, `${chat_settings.text_change_list}\n\n[${user.last_name} ${user.first_name}](tg://user?id=${user.id}) не идёт на игру.`, { parse_mode: 'Markdown' });
            }
            bot.editMessageText(`${chat_settings.stage == 'start' ? chat_settings.text_record_start : chat_settings.stage == 'end' ? chat_settings.text_record_end : chat_settings.text_pay}\n\n${await list(chat_settings)}`, { chat_id: msg.message.chat.id, message_id: msg.message.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chat_settings) });
            bot.answerCallbackQuery(msg.id, { text: phrases.string13, show_alert: true });
            break;
        case 'pay':
            if (user[`${msg.message.chat.id}_play`] !== 2 || user[`${msg.message.chat.id}_go`] !== 1) {
                bot.answerCallbackQuery(msg.id, { text: phrases.string14.replace("%%name%%", msg.from.first_name), show_alert: true });
                return;
            }
            if (user[`${msg.message.chat.id}_paid`]) {
                bot.answerCallbackQuery(msg.id, { text: phrases.string15.replace("%%name%%", msg.from.first_name), show_alert: true });
                return;
            }

            var chat_settings = await bd.get_chat(msg.message.chat.id);
            if (!chat_settings.paid_online) {
                bot.sendMessage(msg.from.id, phrases.string16, { reply_markup: { inline_keyboard: [[{ text: phrases.string17, callback_data: `paid_${msg.message.chat.id}` }]] } })
                    .then(() => {
                        bot.answerCallbackQuery(msg.id, { text: phrases.string18, show_alert: true });
                    })
                    .catch(() => {
                        bot.answerCallbackQuery(msg.id, { text: phrases.string19, show_alert: true });
                    })
                return;
            }

            //
            bot.sendMessage(msg.from.id, `${phrases.string20}\n\n[${chat_settings.paid_online ? "🖥 🌐₽" : "💳"} Оплатить игру](${process.env.HOST}:${process.env.PORT}/pay/${msg.from.id}/${msg.message.chat.id})`, { parse_mode: 'Markdown' })
                .then(() => {
                    bot.answerCallbackQuery(msg.id, { text: phrases.string21, show_alert: true });
                })
                .catch(() => {
                    bot.answerCallbackQuery(msg.id, { text: phrases.string22.replace("%%link%%", `http://t.me/${process.env.BOT_USERNAME1}`), show_alert: true });
                })
            break;
        case 'lock_chat':
            return bot.answerCallbackQuery(msg.id, { text: phrases.string11_1, show_alert: true });
            break;
    }
}
