const bd = require('../../database');;
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const { bot: bot1 } = require('../../main_bot');
const list = require('../../commands/record_list');
const keyboard = require('../../commands/record_keyboard');
const crypto = require('crypto');

const qiwiApi = new QiwiBillPaymentsAPI(process.env.QIWI_SECRET_KEY);

module.exports = async (req, res) => {
    const notificationData = req.body;

    const signatureQuery = req.header('x-api-signature-sha256');        
    let validSignature = false;
    
    try {
        validSignature = await qiwiApi.checkNotificationSignature(signatureQuery, notificationData, process.env.QIWI_SECRET_KEY);  
    } catch (error) {
        return res.status(403).send('Data not found.');
    } 
    
    if(validSignature){
        const { chatId, userId } = notificationData.bill.customFields;
        let userInfo = await bd.get(`id==${userId}`);
        const chatInfo = await bd.get_chat(chatId);
        if(userInfo.length == 0 || chatInfo.ok == false) return res.status(403).send('Fake data.');
        userInfo = userInfo[0];

        const alreadyPaid = userInfo[`${chatInfo.id}_paid`];
        console.log({alreadyPaid});

        if(!alreadyPaid){
            var bot_settings = await bd.settings();
            if (bot_settings.pay_channel_id) {
                var time = new Date();
                time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
                await res.bot.sendMessage(bot_settings.pay_channel_id, `<b>Пользователь оплатил игру.</b>\n<b>Беседа:</b> ${chatInfo.name} (${chatInfo.id})\n<b>ФИО:</b> ${userInfo.last_name} ${userInfo.first_name} ${userInfo.patronymic}\n<b>Сумма:</b> ${notificationData.bill.amount.value} руб.\n<b>Дата:</b> ${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()} ${Math.floor(time.getHours() / 10)}${time.getHours() % 10}:${Math.floor(time.getMinutes() / 10)}${time.getMinutes() % 10}:${Math.floor(time.getSeconds() / 10)}${time.getSeconds() % 10}.`, { parse_mode: 'HTML' });
            }
        
            await bd.set(`id==${userInfo.id}`, `${chatInfo.id}_paid%=%true`);
            await bot1.sendMessage(userInfo.id, `Твой платеж был успешно принят, хорошей игры 😉`);
            await bot1.editMessageText(`${chatInfo.stage == 'start' ? chatInfo.text_record_start : chatInfo.text_record_end}\n\n${await list(chatInfo)}`, { chat_id: chatInfo.id, message_id: chatInfo.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chatInfo) });
            if (chatInfo.stage == 'paid') {
                await bot1.sendMessage(chatInfo.id, `${chatInfo.text_change_list}\n\n[${userInfo.last_name} ${userInfo.first_name}](tg://user?id=${userInfo.id}) оплатил игру.`, { parse_mode: 'Markdown' });
            }
        }
    }

    return res.send(":c");
}