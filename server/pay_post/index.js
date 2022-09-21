const keyboard = require('../../commands/record_keyboard');
const list = require('../../commands/record_list');
const bd = require('../../database');
const md5 = require('md5');

module.exports = async (req, res) => {
    var fakeIP = false;
    var order = req.body;
    var ips = ["136.243.38.147", "136.243.38.149", "136.243.38.150", "136.243.38.151", "136.243.38.189", "136.243.38.108"];
    await ips.forEach(ip => {
        if (req.connection.remoteAddress.indexOf(ip) != -1) {
            fakeIP = false;
        }
    })

    if (fakeIP) {
        res.status(403).send('fake ip');
        return;
    }

    var userInfo = await bd.get(`id==${order.us_id}`);
    var chatInfo = await bd.get_chat(order.us_chat_id);
    if (userInfo.length == 0 || chatInfo.ok == false) {
        res.status(403).send('fake us data');
        return;
    }
    userInfo = userInfo[0];

    var orderId = chatInfo.discount.indexOf(userInfo.id) == -1 ? chatInfo.orderID : chatInfo.orderID1;
    var orderAmount = chatInfo.discount.indexOf(userInfo.id) == -1 ? chatInfo.amount : chatInfo.amount1;
    var checkData = {
        AMOUNT: { data: orderAmount, errorText: 'fake AMOUNT' },
        MERCHANT_ID: { data: chatInfo.merchantID, errorText: 'fake MERCHANT_ID' },
        MERCHANT_ORDER_ID: { data: orderId, errorText: 'fake MERCHANT_ORDER_ID' },
        SIGN: { data: md5(`${chatInfo.merchantID}:${orderAmount}:${chatInfo.secretWord}:${orderId}`), errorText: 'fake SIGN' },
    }

    for (var key in order) {
        if (checkData[key] && checkData[key].data != order[key]) {
            res.status(403).send(checkData[key].errorText);
            return;
        }
    }


    var bot_settings = await bd.settings();
    if (bot_settings.pay_channel_id) {
        var time = new Date();
        time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
        await res.bot.sendMessage(bot_settings.pay_channel_id, `<b>Пользователь оплатил игру</b>\n\nChatId: <b>${chatInfo.id}</b>\nChatName: <b>${chatInfo.name}</b>\n\nID: <b>${userInfo.id}</b>\nФИО: <b>${userInfo.last_name} ${userInfo.first_name} ${userInfo.patronymic}</b>\nEmail: <b>${order.P_EMAIL}</b>\n\nСумма: <b>${order.AMOUNT}</b>\nВремя: <b>${Math.floor(time.getHours() / 10)}${time.getHours() % 10}:${Math.floor(time.getMinutes() / 10)}${time.getMinutes() % 10}:${Math.floor(time.getSeconds() / 10)}${time.getSeconds() % 10} ${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()}</b>`, { parse_mode: 'HTML' });
    }

    await bd.set(`id==${userInfo.id}`, `${chatInfo.id}_paid%=%true`);
    await res.bot1.sendMessage(userInfo.id, `Твой платеж был успешно принят, хорошей игры😉`);
    await res.bot1.editMessageText(`${chatInfo.stage == 'start' ? chatInfo.text_record_start : chatInfo.text_record_end}\n\n${await list(chatInfo)}`, { chat_id: chatInfo.id, message_id: chatInfo.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chatInfo) });
    if (chat_info.stage == 'paid') {
        bot1.sendMessage(chatInfo.id, `${chatInfo.text_change_list}\n\n[${userInfo.last_name} ${userInfo.first_name}](tg://user?id=${userInfo.id}) идёт на игру.`, { parse_mode: 'Markdown' });
    }
    res.status(200).send('YES');
}
