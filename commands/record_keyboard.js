const bd = require('../database');
const phrases = require('./../phrases');

module.exports = keyboard;

async function keyboard(chat_info = Object) {
    var keyboard = {};
    switch (chat_info.stage) {
        case 'start':
            keyboard.inline_keyboard = [[{ text: phrases.string29, callback_data: 'go' }, { text: phrases.string30, callback_data: 'no_go' }]];
            break;
        case 'none':
            break;
        case 'notification':
            break;
        default:
            keyboard.inline_keyboard = [];
            keyboard.inline_keyboard[0] = [];

            var users = await bd.get(`${chat_info.id}_go==1&&${chat_info.id}_play==2`);
            keyboard.inline_keyboard[0] = users.length < chat_info.game_limit_users && chat_info.stage != 'end' ? [{ text: phrases.string29, callback_data: 'go' }, { text: phrases.string30, callback_data: 'no_go' }] : [{ text: phrases.string30, callback_data: 'no_go' }];

            var users_without_pay = false;
            await users.forEach(item => {
                if (item[`${chat_info.id}_paid`] !== true) {
                    users_without_pay = true;
                }
            })

            if (users_without_pay == true) {



                keyboard.inline_keyboard[1] = [{ text: phrases.string31.replace("%%smile%%", chat_info.paid_online ? "🖥 🌐₽" : "💳"), callback_data: 'pay' }];
            }
            break;
    }
    return keyboard;
}