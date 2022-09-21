const
    express = require('express'),
    app = express();

var bot_tg;
var bot_tg1;

require('./cronTask');

module.exports = async (bot, bot1) => {
    bot_tg = bot;
    bot_tg1 = bot1;
}

app.use((req, res, next) => {
    res.bot = bot_tg1;
    res.bot1 = bot_tg;
    next();
});
app.use(require('cookie-parser')());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    if (req.query.login) {
        res.cookie('login', req.query.login, { expires: new Date(Date.now() + 15768000000), httpOnly: true });
        res.redirect("/");
    } else {
        next();
    }
})

app.use((req, res, next) => {
    if (req.url.match(/.+(jpg|png|svg)/)) {
        res.setHeader('Cache-Control', 'public, max-age=43200');
    }
    if (req.url.match(/.+(css|js)/)) {
        res.setHeader('Cache-Control', 'public, max-age=1800');
    }
    next();
})

app.get("/", require('./cp'));

app.get(/^\/registrar_settings/, require('./registrar_settings'));
app.post(/^\/registrar_settings/, require('./registrar_settings_post'));

app.get(/^\/registrar_user/, require('./registrar_user'));
app.post(/^\/registrar_user/, require('./registrar_user_post'));

app.get(/^\/record_settings/, require('./record_settings'));
app.post(/^\/record_settings/, require('./record_settings_post'));

app.get(/^\/record_settings/, require('./record_settings'));
app.post(/^\/record_settings/, require('./record_settings_post'));

app.get('/teams/:teamId', require('./teams'));
app.post('/teams/:teamId/:link', require('./teams_post'));

app.get('/pay/:userId/:chatId*?', require('./pay'));
app.post(/^\/pay_qiwi/, require('./pay_qiwi'));
app.post(/^\/pay_robokassa/, require('./pay_robokassa_post'));
app.post(/^\/pay/, require('./pay_post'));

app.get(/^\/administrators/, require('./administrators'));
app.post('/administrators/:link', require('./administrators_post'));

app.use((req, res) => {
    res.status(404).send('Страница не найдена :(');
})

process.env.PORT = process.env.PORT || 3000
app.listen(process.env.PORT, console.log(`Сервер работает на порту ${process.env.PORT}`));