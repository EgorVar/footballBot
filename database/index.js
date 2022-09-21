const del = require('./del_user_info');
const get = require('./get_user_info');
const get_chat = require('./get_chat_info');
const set = require('./set_user_info');
const set_chat = require('./set_chat_info');
const into = require('./into_user_info');
const into_chat = require('./into_chat_info');
const settings = require('./get_bot_info');

module.exports = {
    del,
    get,
    get_chat,
    set,
    set_chat,
    into,
    into_chat,
    settings
}