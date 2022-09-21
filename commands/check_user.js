const bd = require('../database');
const bot = require('../createBot/main_bot_registration')


var bot_settings;
module.exports = () => {
    bot_settings = bot;
    check();
    // setInterval(check, 14400000);
    setInterval(check, 14400);
}

async function check() {
    var users = await bd.get('registrar_type==3') || [];
    var chats = await bd.get_chat('all') || [];
    for (var i = 0; i < chats.length; i++) {
        chats[i].members = [];
    }

    await users.forEach(async (user) => {
        await chats.forEach(async (chat, index) => {
            try { //Фикс getChatMember
                var status = await bot_settings.getChatMember(chat.id, user.id);
                status = status.status;
                if (status == 'creator' || status == 'administrator' || status == 'member' || status == 'restricted') {
                    chats[index]['members'][chats[index]['members'].length] = user.id;
                    await bd.set_chat(chat.id, { members: chats[index]['members'] });
                }
            } catch (e) {
                // console.log(e);
            }
        })
    })
}
