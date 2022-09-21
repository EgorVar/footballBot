const bd = require('../../database');
const robokassa = require('node-robokassa');
// const { bot: bot1 } = require('../../main_bot');
const list = require('../../commands/record_list');
const keyboard = require('../../commands/record_keyboard');

const robokassaHelper = new robokassa.RobokassaHelper({  
    // REQUIRED OPTIONS:
    merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN,
    hashingAlgorithm: 'md5',
    password1: process.env.ROBOKASSA_FIRST_PASSWORD,
    password2: process.env.ROBOKASSA_SECOND_PASSWORD,
    // OPTIONAL CONFIGURATION
    testMode: process.env.DEBUG == "true" ? true : false, // Whether to use test mode globally
    resultUrlRequestMethod: 'POST' // HTTP request method selected for "ResultURL" requests  
});


module.exports = async (req, res) => {
    // Robokassa IP MASK: 185.59.216.0/24 (185.59.216.1 - 185.59.216.254);
    if(req.connection.remoteAddress.includes("185.59.216") || process.env.DEBUG == "true"){
        robokassaHelper.handleResultUrlRequest(req, res, async function (values, userData) {
            const { chatId, userId } = userData;
            let userInfo = await bd.get(`id==${userId}`);
            const chatInfo = await bd.get_chat(chatId);
            if(userInfo.length == 0 || chatInfo.ok == false) return res.status(403).send('Fake data.');
            userInfo = userInfo[0];
            
            var bot_settings = await bd.settings();
            if (bot_settings.pay_channel_id) {
                var time = new Date();
                time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
                await res.bot.sendMessage(bot_settings.pay_channel_id, `<b>Пользователь оплатил игру.</b>\n<b>Беседа:</b> ${chatInfo.name} (${chatInfo.id})\n<b>ФИО:</b> ${userInfo.last_name} ${userInfo.first_name} ${userInfo.patronymic}\n<b>Сумма:</b> ${values.outSum} руб.\n<b>Дата:</b> ${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()} ${Math.floor(time.getHours() / 10)}${time.getHours() % 10}:${Math.floor(time.getMinutes() / 10)}${time.getMinutes() % 10}:${Math.floor(time.getSeconds() / 10)}${time.getSeconds() % 10}.`, { parse_mode: 'HTML' });
            }
        
            await bd.set(`id==${userInfo.id}`, `${chatInfo.id}_paid%=%true`);
            res.bot1.sendMessage(userInfo.id, `Твой платеж был успешно принят, хорошей игры😉`);
            res.bot1.editMessageText(`${chatInfo.stage == 'start' ? chatInfo.text_record_start : chatInfo.text_record_end}\n\n${await list(chatInfo)}`, { chat_id: chatInfo.id, message_id: chatInfo.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chatInfo) });
            if (chatInfo.stage == 'paid') {
                res.bot1.sendMessage(chatInfo.id, `${chatInfo.text_change_list}\n\n[${userInfo.last_name} ${userInfo.first_name}](tg://user?id=${userInfo.id}) оплатил игру.`, { parse_mode: 'Markdown' });
            }
          });

    }else{
        return res.status(403).send(':c');
    }
}