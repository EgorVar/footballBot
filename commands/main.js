const bd = require('../database');
const list = require('./record_list');
const keyboard = require('./record_keyboard');
const phrases = require('./../phrases');
const { buttons_links } = require('./keyboards');
const { isMemberChat } = require('./utils');
const bot = require('../createBot/main_bot_registration')

module.exports = async (msg, match) => {
	const isMember = await isMemberChat(msg);
	var bot_settings = await bd.settings();
	if (msg.new_chat_title) await bd.set_chat(msg.chat.id, { name: msg.new_chat_title });
	if (msg.chat.type != 'private') {
		if (!msg.text) return;

		if (msg.text.indexOf("/set ") > -1) {
			if (msg.from.id != bot_settings.main_admin) return

			var dataName = msg.text.match(/\/set (.+) (.+)/)[1];
			var dataValue = msg.text.match(/\/set (.+) (.+)/)[2];

			bd.set(`id==${msg.reply_to_message.from.id}`, `${msg.chat.id}_${dataName}%=%${dataValue}`);

			var chat_info = await bd.get_chat(msg.chat.id);
			bot.editMessageText(`${chat_info.stage == 'start' ? chat_info.text_record_start : chat_info.text_record_end}\n\n${await list(chat_info)}`, { chat_id: chat_info.id, message_id: chat_info.message_id, parse_mode: 'Markdown', reply_markup: await keyboard(chat_info) });
			bot.deleteMessage(msg.chat.id, msg.message_id);
		}

		if (/\/unban/.test(msg.text) && msg.from.id == bot_settings.main_admin) {
			if (!msg.reply_to_message) return bot.deleteMessage(msg.chat.id, msg.message_id);

			const unbanUser = msg.reply_to_message.from.id;
			if (unbanUser) {
				let user = await bd.get(`id==${unbanUser}`);
				if (user.length == 0) return; user = user[0];

				if (user[`${msg.chat.id}_ban_until`] >= Date.now()) {
					await bd.set(`id==${unbanUser}`, `${msg.chat.id}_ban_until%=%0`);
					bot.sendMessage(msg.chat.id, `+`).then((res) => {
						setTimeout(async () => {
							await bot.deleteMessage(res.chat.id, res.message_id);
							await bot.deleteMessage(msg.chat.id, msg.message_id);
						}, 800);
					});
				} else {
					await bot.deleteMessage(msg.chat.id, msg.message_id);
				}
			}
		}

		return;
	} else {
		if (msg.text.indexOf('/start') > -1) return;
		if (msg.text.indexOf('/rating') > -1) {
			var allUsers = await bd.get(`registrar_type==3`);
			allUsers.sort((a, b) => {
				return b.rating - a.rating;
			})
			var text = phrases.string1 + "\n";
			for (var i = 0; i < 10 && i < allUsers.length; i++) {
				text += `${i == 0 ? '🥇' : i == 1 ? '🥈' : i == 2 ? '🥉' : i + 1 + '.'} <a href="tg://user?id=${allUsers[i].id}">${allUsers[i].first_name} ${allUsers[i].last_name}</a> - <b>${allUsers[i].rating}</b>\n`;
			}
			var additional_text = '';
			allUsers.forEach((user, index) => {
				if (user.id == msg.from.id && index > 10) {
					additional_text = `${index}.  <a href="tg://user?id=${allUsers[index - 1].id}">${allUsers[index - 1].first_name} ${allUsers[index - 1].last_name}</a> - <b>${allUsers[index - 1].rating}</b>\n${index + 1}.  <a href="tg://user?id=${user.id}">${user.first_name} ${user.last_name}</a> - <b>${user.rating}</b>\n${allUsers[index + 1] ? `${index + 2}.  <a href="tg://user?id=${allUsers[index + 1].id}">${allUsers[index + 1].first_name} ${allUsers[index + 1].last_name}</a> - <b>${allUsers[index + 1].rating}</b>` : ''}`;
				}
			})
			if (additional_text) text += `...\n` + additional_text;

			text += `\n\n🏆 Полный К-И чемпионат: http://играть.мини-футбол.москва/наш-чемпионат`

			bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
			return;
		}

		var user = await bd.get(`id==${msg.from.id}`);
		if (user.length == 0) {
			user = await bd.into(msg.from.id, { id: msg.from.id });
		}
		user = user[0];

		if (user.registrar_type != 3) {
			bot.sendMessage(msg.chat.id, `${phrases.string2.replace("%%link%%", "https://t.me/" + process.env.BOT_USERNAME)}`);
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
}