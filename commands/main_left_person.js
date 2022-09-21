const bd = require('../database');
const bot = require('../createBot/main_bot_registration')


module.exports = async (msg, match) => {
    var users = await bd.get_chat(msg.chat.id);
    users = users.members;

    if(users){
        var new_users = [];
        await users.forEach(item => {
            if (item != msg.left_chat_member.id) {
                new_users[new_users.length] = item;
            }
        })
        users = new_users;
        bd.set_chat(msg.chat.id, { members: users });
    }
}