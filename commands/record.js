/*
* Привет, просто хочу немного рассказать об этом коде
* эта часть кода(record) самая важна поэтому если ты будешь ее править, то будь очень аккуратен.
*
* Прощу прощение что не комментировал код раньше :)
* Если будут вопросы, то вот мой Telegram @ViPerCent
*/

const
    bd = require('../database'), //Библиотека (если ее так можно назвать) помогает в работе с данными
    list = require('./record_list'), //Отвечает за список игроков
    teams = require('../teamDataBase'),
    keyboard = require('./record_keyboard'), //Отвечает за клавиатуру
    phrases = require('./../phrases'),
    ms = require('ms'),
    fs = require('fs');

const bot = require('../createBot/main_bot_registration')


module.exports = async () => {
    check();
    setInterval(check, 60000);
}

//Функция проверяющая время(начало/конец записи, отлата и т.д.)
async function check() {
    var chats = await bd.get_chat('all') || [];

    await chats.forEach(async (item) => {
        await check_chat(item);
    })
}

async function check_chat(item) {
    if (!item.work) return;

    var time = new Date();
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
    var chat_time = await set_time(item);
    var week = time.getDay() == item.game_day;
    var notification = Math.floor(time.getTime() / 60000) >= Math.floor(chat_time.start.getTime() / 60000) - item.game_notification_time && Math.floor(time.getTime() / 60000) < Math.floor(chat_time.start.getTime() / 60000);
    var start = Math.floor(time.getTime() / 60000) >= Math.floor(chat_time.start.getTime() / 60000) && Math.floor(time.getTime() / 60000) <= Math.floor(chat_time.start.getTime() / 60000) + 5;
    var end = Math.floor(time.getTime() / 60000) >= Math.floor(chat_time.end.getTime() / 60000) && Math.floor(time.getTime() / 60000) <= Math.floor(chat_time.end.getTime() / 60000) + 5;

    //Уведомление о записи
    if (notification && !start && item.stage == 'none') {
        var now_time = new Date();
        now_time.setTime(time.getTime() + item.game_notification_time * 60000);
        if (now_time.getDay() == item.game_day) {
            item = await bd.set_chat(item.id, { stage: 'notification', time_end: 0, time_paid: 0 });
            await message('notification', item, false, false);
        }
    }

    //пора начать запись
    if (week && start && item.stage == 'notification') {
        item = await bd.set_chat(item.id, { stage: 'start', time_end: 0, time_paid: 0 });
        await bot.sendMessage(item.id, item.text_notification, { parse_mode: 'Markdown' }); // Дублирование уведомления в чат
        for (let member in item.members) {
            try {
                await bot.sendMessage(item.members[member], item.text_notification, { parse_mode: 'Markdown' }); // Дублирование уведомления в лс
            } catch (e) { };
        }
        await message('start_record', item);
        await bd.set(`id->0`, `${item.id}_go%=%-2%,%${item.id}_play%=%0%,%${item.id}_go_attempt%=%0`);
        var users = item.members || [];
        await users.forEach(async (id) => {
          var base = false,
          nonPaidWithPriority = false
          if(item.base.indexOf(id) != -1) base = true;
          else if (item.nonPaidWithPriority.indexOf(id) != -1) nonPaidWithPriority = true

          await bd.set(`id==${id}`, `${item.id}_paid%=%${base}%,%${item.id}_base%=%${base}%,%${item.id}_paidWithPriority%=%${false}%,%${item.id}_go%=%-1%,%${item.id}_play%=%0%,%${item.id}_time%=%0%,%${item.id}_lastClick%=%0`);

          if(nonPaidWithPriority) await bd.set(`id==${id}`, `${item.id}_paid%=%${!nonPaidWithPriority}%,%${item.id}_paidWithPriority%=%${nonPaidWithPriority}%,%${item.id}_go%=%-1%,%${item.id}_play%=%0%,%${item.id}_time%=%0%,%${item.id}_lastClick%=%0`);
      })
    }

    //пора закончить запись
    if (week && end && item.stage == 'start') {
        var ban_mans = bd.get(`${item.id}_go==-1`);

        const ban_until = Date.now() + ms("10 days");
        let chatAdmins = await bot.getChatAdministrators(item.id); chatAdmins = chatAdmins.map(a => a.user.id);

        var ban_info = [];

        await ban_mans.forEach(async (user) => {
            if (item.block) { // Режим блокировки за игнор
                if (!user[`${item.id}_ban_until`]) { // Если не банился ранее, баним
                    if (!chatAdmins.includes(user.id)) { // Иммунитет для адм
                        await bd.set(`id==${user.id}`, `${item.id}_ban_until%=%${ban_until}`);
                        ban_info.push(`${user["first_name"]} ${user["last_name"]}`);
                    }
                } else if (user[`${item.id}_ban_until`] <= Date.now()) { // Если бан уже старый, обновляем
                    if (!chatAdmins.includes(user.id)) { // Иммунитет для адм
                        await bd.set(`id==${user.id}`, `${item.id}_ban_until%=%${ban_until}`);
                        ban_info.push(`${user["first_name"]} ${user["last_name"]}`);
                    }
                } // Если бан актуальый, не добавляем срок
            }

            // await bot.sendMessage(item.id, `${user["first_name"]} ${user["last_name"]} не ответил, но блокировка за это отключена.`, { parse_mode: 'Markdown' });
            await bd.set(`id==${user.id}`, `${item.id}_go%=%-2`);
        })

        await bot.sendMessage(item.id, `По итогам записи ${ban_info.length > 0 ? "за отсутствие ответа получили 🟨🙋‍♂ карточку и пропускают следующую запись, а значит и игру:\n" + ban_info.join("\n") : "заблокированных нет."}`, { parse_mode: 'HTML' });


        const players = bd.get(`${item.id}_play==2&&${item.id}_go==1`);
        for(let player in players){
            if(!item.base.includes(players[player].id))
                try {
                    if(item.paid_online)
                        await bot.sendMessage(players[player].id, `${phrases.string20}\n\n[${item.paid_online ? "🖥 🌐₽" : "💳"} Оплатить игру](${process.env.HOST}:${process.env.PORT}/pay/${players[player].id}/${item.id})`, { parse_mode: 'Markdown' })
                    else
                        await bot.sendMessage(players[player].id, phrases.string16, { reply_markup: { inline_keyboard: [[{ text: phrases.string17, callback_data: `paid_${item.id}` }]] } });
                } catch (error) {
                    console.log(error);
                    await bot.sendMessage(item.id, `⛔️ У пользователя ${players[player].id} заблокирован бот Управсостава.`, { parse_mode: 'HTML' });
                }
        }
        bot.editMessageText(`${item.stage == 'start' ? item.text_record_start : item.stage == 'end' ? item.text_record_end : item.text_pay}\n\n${await list(item)}`, { chat_id: item.id, message_id: item.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(item) });

        item = await bd.set_chat(item.id, { stage: 'end', time_end: time.getTime(), time_paid: 0 });
        await message('end_record', item);
    }

    //Информация о игре
    if (item.time_end > 0 && Math.floor(time.getTime() / 60000) >= Math.floor(item.time_end / 60000) + item.game_waiting_time) {
        item = await bd.set_chat(item.id, { stage: 'none', time_end: 0, time_paid: 0 });
        await bd.set(`${item.id}_paid==false`, `${item.id}_play%=%0%,%${item.id}_go%=%0`);
        await message('usersList', item);

        var settings = await bd.settings();
        var rosterPlayers = [];
        await bd.get(`${item.id}_go==1&&${item.id}_play==2`).forEach(user => {
            rosterPlayers.push(user.id);
        })
        var info = await teams.init({ rosterPlayers: rosterPlayers });

        // await bot.sendMessage(settings.main_admin, `${phrases.string27}\n\n[Настроить список](${process.env.HOST}:${process.env.PORT}/teams/${info.id}?type=edit)`, { parse_mode: 'Markdown' });
        // await bot.sendMessage(item.id, `${item.text_game_info1}\n\n[Посмотреть](${process.env.HOST}:${process.env.PORT}/teams/${info.id})`, { parse_mode: 'Markdown' });

        await bot.sendMessage(settings.main_admin, `${phrases.string27}\n\n[Настроить список](${process.env.HOST}:${process.env.PORT}/teams/${info.id}?chatId=${item.id}&type=edit)`, { parse_mode: 'Markdown' });
        await bot.sendMessage(item.id, `${item.text_game_info1}\n\n[Посмотреть составы команд](${process.env.HOST}:${process.env.PORT}/teams/${info.id}?chatId=${item.id})`, { parse_mode: 'Markdown' });
        await bd.set(`id->0`, `${item.id}_go%=%-2%,%${item.id}_play%=%0%,%${item.id}_go_attempt%=%0`);
    }

    //Проверка наличия оплаты
    await check_paid(item);
}

async function check_paid(chat_info = Object) {
    if (chat_info.stage != 'end' && chat_info.stage != 'paid') return;
    if (chat_info.time_end == 0 || chat_info.time_end == 0) return;


    var users_without_pay = bd.get(`${chat_info.id}_play==2&&${chat_info.id}_paid!=true`) || [];
    var new_users_without_pay = [];
    await users_without_pay.forEach(user => {
        if (user[`${chat_info.id}_go`] == 1) {
            new_users_without_pay.push(user);
        }
    })
    users_without_pay = new_users_without_pay;
    var time = new Date();
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);

    if (chat_info.stage == 'end') {
        if (Math.floor(time.getTime() / 60000) - Math.floor(chat_info.time_end / 60000) >= chat_info.game_paid_time) {
            await users_without_pay.forEach(async (user) => {
                await bd.set(`id==${user.id}`, `${chat_info.id}_play%=%0%,%${chat_info.id}_go%=%0`);
            })
            await bd.set(`${chat_info.id}_play==0`, `${chat_info.id}_play%=%0%,%${chat_info.id}_go%=%0`);
            chat_info = await bd.set_chat(chat_info.id, { stage: 'paid', time_paid: time.getTime() });
            for (let member in chat_info.members) {
                try {
                    // await bot.sendMessage(chat_info.members[member], chat_info.text_pay, { parse_mode: 'Markdown' }); // Дублирование уведомления в лс
                } catch (e) {
                    console.log(e);
                };
                // console.log("=======");
                // console.log(users_without_pay);
                // if(chat_info.members[member])
            }
            await message('wait', chat_info);
            await message('game_info', chat_info, false, false, false);
            await bd.set(`${chat_info.id}_play==1&&${chat_info.id}_go==1`, `${chat_info.id}_play%=%0%,%${chat_info.id}_go%=%0`);
            return;
        }
    }

    if (chat_info.stage == 'paid') {
        var change = false;
        await users_without_pay.forEach(async user => {
            if (Math.floor(time.getTime() / 60000) - Math.floor(user[`${chat_info.id}_recording_time`] / 60000) >= chat_info.game_paid1_time) {
                change = true;
                await bd.set(`id==${user.id}`, `${chat_info.id}_play%=%0%,%${chat_info.id}_go%=%0`);
                await bot.sendMessage(chat_info.id, phrases.string28.replace("%%name%%", `[${user.last_name} ${user.first_name}](tg://user?id=${user.id})`), { parse_mode: 'Markdown' })
            }
        })

        if (change) await message('wait', chat_info, true);
    }
}

function set_time(chat_info = Object) {
    var hour_from = chat_info.game_start_hour;
    var minute_from = chat_info.game_start_minute;
    var time_from = new Date();
    time_from.setMinutes(time_from.getMinutes() + time_from.getTimezoneOffset() + 180);
    time_from.setHours(hour_from, minute_from);


    var hour_to = chat_info.game_end_hour;
    var minute_to = chat_info.game_end_minute;
    var time_to = new Date();
    time_to.setMinutes(time_to.getMinutes() + time_to.getTimezoneOffset() + 180);
    time_to.setHours(hour_to, minute_to);

    return { start: time_from, end: time_to };
}

async function message(type = String, chat_info = Object, edit_message = false, deleted = true, pin = true) {
    var message_text = String;
    var GeoTag = { send: false, data: {} };
    var Video = { send: false, data: {} };
    switch (type) {
        case 'notification':
            message_text = chat_info.text_notification;
            break;
        case 'start_record':
            message_text = chat_info.text_record_start;
            break;
        case 'end_record':
            message_text = `${chat_info.text_record_end}\n\n${await list(chat_info)}`;
            break;
        case 'wait':
            message_text = `${chat_info.text_pay}\n\n${await list(chat_info)}`;
            break;
        case 'usersList':
            message_text = `${chat_info.text_users_list}\n\n${await list(chat_info)}`;
            break;

        case 'game_info':
            message_text = chat_info.text_game_info;
            break;
    }

    var checkText = message_text.toLowerCase();
    if (checkText.indexOf("#geotag") != -1) {
        GeoTag.send = true;
        var geotagText = checkText.substring(checkText.indexOf("#geotag") + "#geotag".length);
        geotagText = geotagText.substring(0, geotagText.indexOf("#"));
        GeoTag.data.lat = parseFloat(geotagText.substring(geotagText.indexOf('lat') + 'lat'.length));
        GeoTag.data.lon = parseFloat(geotagText.substring(geotagText.indexOf('lon') + 'lon'.length));
    }

    // %%#Video ChromaKey.mp4#%%
    if (message_text.indexOf("#Video") != -1) {
        try {
            Video.send = true;
            var videoText = message_text.match(/\%\%#Video (.+)#\%\%/)[1];
            var videoUrl = `./commands/videos/${videoText}`;
            Video.data.src = fs.createReadStream(videoUrl);
        } catch (e) { };
    }

    message_text = message_text.replace(message_text.slice(message_text.indexOf("%%"), message_text.lastIndexOf("%%") + "%%".length), '');

    if (edit_message) {
        await bot.editMessageText(message_text, { chat_id: chat_info.id, message_id: chat_info.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chat_info) });
        return;
    }

    if (deleted) {
        bot.deleteMessage(chat_info.id, chat_info.message_id);
    }

    if (!pin) {
        await bot.sendMessage(chat_info.id, message_text, { parse_mode: 'Markdown' });
    } else {
        await bot.sendMessage(chat_info.id, message_text, { parse_mode: 'Markdown', reply_markup: await keyboard(chat_info) }).then(res => {
            bot.pinChatMessage(res.chat.id, res.message_id);
            bd.set_chat(chat_info.id, { message_id: res.message_id });
        })
    }
    if (GeoTag.send) {
        await bot.sendLocation(chat_info.id, GeoTag.data.lat, GeoTag.data.lon);
    }
    if (Video.send) {
        await bot.sendVideo(chat_info.id, Video.data.src);
    }
}
