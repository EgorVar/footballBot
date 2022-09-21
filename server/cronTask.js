const
	bd = require('../database'),
	{ managerNotification } = require('./sendNotification'),
	phrases = require('./../phrases'),
	fetchJson = require('fetch-json'),
	fs = require('fs'),
	CronJob = require('cron').CronJob,
	archiver = require('archiver');

process.env.TZ = "Europe/Moscow";

new CronJob('0 0 12 * * *', async function () { // Каждый день в 12:00
	sendCongratulationBirthday();
	createBaseBackup();
}, null, true, 'Europe/Moscow');

setInterval(cronTask, 60000);
setInterval(refreshSite, 60000);
setInterval(refreshChatsSite, 60000);

// createBaseBackup();
async function createBaseBackup() {
	let ts = Date.now();
	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();

	var output = fs.createWriteStream(`./backups/backup-${year + "-" + month + "-" + date}.zip`);
	var archive = archiver('zip');	
	output.on('close', function () {
		console.log(archive.pointer() + ' total bytes');
		console.log('archiver has been finalized and the output file descriptor has closed.');
	});	
	archive.on('error', function(err){
		throw err;
	});	
	archive.pipe(output);
	archive.directory('database/chat_info', 'chat_info');
	archive.directory('database/chat_info_ratings', 'chat_info_ratings');
	archive.directory('database/users_img', 'users_img');
	archive.directory('database/users_info', 'users_info');
	archive.finalize();
}
// sendCongratulationBirthday();
async function sendCongratulationBirthday() {
	let allUsers = await bd.get(`registrar_type==3`);
	for (let user in allUsers) {
		if (/(([0-9]{2}\.[0-9]{2})\.[0-9]{4})/.test(allUsers[user].birthdate)) {
			const userDate = allUsers[user].birthdate.match(/(([0-9]{2}\.[0-9]{2})\.[0-9]{4})/)[2];
			const currentDate = ('0' + new Date().getDate()).slice(-2) + "." + ('0' + (new Date().getMonth() + 1)).slice(-2);
			if (userDate == currentDate) {
				const allVariants = [phrases.string53, phrases.string54, phrases.string55, phrases.string56, phrases.string57, phrases.string58, phrases.string59, phrases.string60, phrases.string61, phrases.string62];
				const selectVariant = randomElem(allVariants);
				await managerNotification(allUsers[user].id, selectVariant.replace("%%name%%", allUsers[user].first_name + " " + allUsers[user].last_name));
				await managerNotification(430454430, selectVariant.replace("%%name%%", allUsers[user].first_name + " " + allUsers[user].last_name));	// Андрею пересылать
			}
		} else {
			var bot_settings = await bd.settings();
			await managerNotification(bot_settings.moderation_chat, `У пользователя ${allUsers[user].first_name} ${allUsers[user].last_name} установлена некорректная дата рождения: ${allUsers[user].birthdate}\nТребуемый формат: ДД.ММ.ГГГГ.\nЭта ошибка не критична, но поздравления с Днём Рождения пользователь не получит.`);
		}
	}
}

async function cronTask() {
	var chats = await bd.get_chat('all') || [];
	for (const chat in chats) {
		if (chats[chat].work) {
			if (chats[chat].stage == "none" && chats[chat].auto_change_value != 0) {
				await bd.set_chat(chats[chat].id, { paid_online: false, auto_change_current: chats[chat].auto_change_value });
			}

			if (!chats[chat].paid_online) { // Если установлено на Перевод на карту
				if (chats[chat].auto_change_value != 0) { // Если вообще есть лимит автовыключения
					logInFile(chats[chat].id, `CURRENT STAGE: ${chats[chat].stage}, AUTO_CHANGE_CURRENT: ${chats[chat].auto_change_current}, AUTO_CHANGE_VALUE: ${chats[chat].auto_change_value}`);

					if (chats[chat].stage == "end" || chats[chat].stage == "paid") {
						if (chats[chat].auto_change_current > 0) { // Если он равен нулю
							// logInFile(chats[chat].id, `CURRENT -1 MIN Stage '${chats[chat].stage}', auto_change_current: ${chats[chat].auto_change_current-1}`);
							await bd.set_chat(chats[chat].id, { auto_change_current: chats[chat].auto_change_current - 1 });
						} else {
							logInFile(chats[chat].id, `SEND NOTIFICATION, {paid_online: true}`);
							await managerNotification(chats[chat].id, phrases.string52);
							await bd.set_chat(chats[chat].id, { paid_online: true });
						}
					}
				}
			}
		}
	}
}

function logInFile(chatId, message) {
	const str = `[${getTimefLog()}][CHAT ${chatId}]: ${message}`;
	fs.appendFile("./server/stageLogs.log", str + "\n", function (error) {
		if (error) {
			if (error) {
				throw error;
			}
		}
	});
}

function getTimefLog(format, a, ts) { a = a || new Date(); format = format ? format : "%Y-%m-%d %H:%M:%S"; a.setHours(a.getHours() + (ts || 0)); var f = { Y: a.getFullYear(), y: a.getFullYear() - (a.getFullYear() >= 2e3 ? 2e3 : 1900), m: a.getMonth() + 1, d: a.getDate(), H: a.getHours(), M: a.getMinutes(), S: a.getSeconds() }, k; for (k in f) format = format.replace('%' + k, f[k] < 10 ? "0" + f[k] : f[k]); return format; }

function randomElem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

refreshSite();
refreshChatsSite();
async function refreshSite() {
	// Общий рейтинг
	let usersObject = {};
	let allUsers = await bd.get(`registrar_type==3`);
	usersObject["lastUpdate"] = new Date();
	usersObject["players"] = {};

	allUsers.sort((a, b) => {
		if(b.rating < a.rating) return -1;
		if(b.rating > a.rating) return 1;
		// При равном рейтинге сортируем по играм
		if(a.games < b.games) return -1;
		if(a.games > b.games) return 1;
	})

	for (let user in allUsers) {
		usersObject["players"][allUsers[user].id + " " + allUsers[user].last_name] = { id: allUsers[user].id, name: allUsers[user].last_name + " " + allUsers[user].first_name, rating: allUsers[user].rating, games: allUsers[user].games };
		// if (allUsers[user].rating > 0)
	}

	// fetchJson.post(`http://test/index.php?jsonUpdate`, usersObject)//.then(handleData).catch(console.error);	
	fetchJson.post(`${process.env.ONLINE_RATING}?jsonUpdate`, usersObject)//.then(handleData).catch(console.error);	
}
async function refreshChatsSite() {
	// Общий рейтинг
	let chatObject = {};
	let chats = await bd.get_chat('all') || [];
	let all_users = await bd.get(`registrar_type==3`);
	
	await chats.forEach(async (item) => {
		let usersRating = [];
		let chatInfoRatings = fs.readFileSync(`./database/chat_info_ratings/${item.id}`);
		chatInfoRatings = JSON.parse(chatInfoRatings);
		
		chatInfoRatings.sort((a, b) => {
			if(b.data.rating < a.data.rating) return -1;
			if(b.data.rating > a.data.rating) return 1;
			// При равном рейтинге сортируем по играм
			if(a.data.games < b.data.games) return -1;
			if(a.data.games > b.data.games) return 1;
		})

		chatInfoRatings.forEach(async (user) => {
			try {
				const full_user_info = all_users.find(a => a.id === user.userId);
				usersRating.push({user: user.userId, name: full_user_info.last_name + " " + full_user_info.first_name, data: user.data });
				
			} catch (error) {}
		});

		const hided = item.name.indexOf("🚫") > -1;
		if(!hided)
			chatObject[item.id] = {name: item.name, id: item.id, users: usersRating, lastUpdate: new Date() }
	})

	// fetchJson.post(`http://test/index.php?chatUpdate`, chatObject)//.then(handleData).catch(console.error);	
	fetchJson.post(`${process.env.ONLINE_RATING}?chatUpdate`, chatObject)//.then(handleData).catch(console.error);	
}