const telegram = require('node-telegram-bot-api');
const bot = new telegram(process.env.BOT_TOKEN, {polling: true});

module.exports = bot;
