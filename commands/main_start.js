const bd = require('../database');
const phrases = require('./../phrases');
const { buttons_links } = require('./keyboards');
const { isMemberChat } = require('./utils');
const bot = require('../createBot/main_bot_registration')

module.exports = async (msg, match) => {
	const isMember = await isMemberChat(msg);

	if (msg.chat.type != 'private') return;
	var user = await bd.get(`id==${msg.from.id}`);
	if (user.length == 0) {
		user = await bd.into(msg.from.id, { id: msg.from.id });
	}
	user = user[0];

	if (user.registrar_type != 3) {
		bot.sendMessage(msg.chat.id, phrases.string25.replace("%%name%%", `[${msg.from.first_name}](tg://user?id=${msg.from.id})`).replace("%%link%%", `*@${process.env.BOT_USERNAME}*`), { parse_mode: 'Markdown' });
		return;
	}

	var chats = await bd.get_chat('all') || [];
	chats.sort(function(a, b){
		return a.priority - b.priority;
	})

	var buttons = [];
	for (const chat in chats) {
		const title = chats[chat].name;
		const link = chats[chat].chat_link;
		const hided = title.indexOf("🚫") > -1;
		const locked = title.indexOf("🔒") > -1;

		if (!hided) {
			if (locked) {
				buttons.push([{ text: title, callback_data: "lock_chat" }]);
			} else {
				buttons.push([{ text: title, url: link }]);
			}
		}
	}

	await bot.sendMessage(msg.chat.id, phrases.string26.replace("%%name%%", `[${msg.from.first_name}](tg://user?id=${msg.from.id})`), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
	if(!isMember) await bot.sendMessage(msg.chat.id, phrases.string69);
	await bot.sendMessage(msg.chat.id, phrases.string66, { parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons_links } });
}