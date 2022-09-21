require('dotenv').config({ path: './.env' })

process.on('unhandledRejection', err => {
    console.log(err);
});


process.on('uncaughtException', function (error) {
    console.log("\x1b[31m", "Exception: ", error, "\x1b[0m");
});

process.on('unhandledRejection', function (error, p) {
    console.log("\x1b[31m", "Error: ", error.message, "\x1b[0m");
});


var bot = require('./main_bot')
var bot1 = require('./registrar_bot')
require('./server')(bot, bot1)