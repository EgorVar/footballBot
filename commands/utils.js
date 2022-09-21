const REQUIRED_SUBSCRIBE_CHANNEL = true;
const bot = require('../createBot/main_bot_registration')

async function isMemberChat(msg) {
    if (!REQUIRED_SUBSCRIBE_CHANNEL) return true;

    let isMemberAccess = false;
    try {
        const isMember = await bot.getChatMember('@football_chat', msg.from.id)
        // console.log(isMember);
        switch (isMember.status) {
            case 'creator':
                isMemberAccess = true;
                break;
            case 'administrator':
                isMemberAccess = true;
                break;
            case 'member':
                isMemberAccess = true;
                break;
        }
    } catch (e) {
        console.log(e);
    }
    // console.log(isMemberAccess);
    return isMemberAccess
}

module.exports = {
    isMemberChat
}