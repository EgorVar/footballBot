const 
	prequest = require('prequest'),
	urlencode = require('urlencode');

async function managerNotification(chat_id, text){
  return await prequest(`https://api.telegram.org/bot${process.env.BOT_TOKEN1}/sendMessage?chat_id=${chat_id}&text=${urlencode(text)}`);	
}

async function registerNotification(chat_id, text){
  return await prequest(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${chat_id}&text=${urlencode(text)}`);	
}

module.exports = {
	managerNotification,
	registerNotification	
}