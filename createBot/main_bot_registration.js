const telegram = require('node-telegram-bot-api');
const bot = new telegram(process.env.BOT_TOKEN1, {polling: true});

module.exports = bot;
