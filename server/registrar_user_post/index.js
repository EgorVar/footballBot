const 
    bd = require('../../database'),
    checkRules = require('../checkRules');

module.exports = async (req, res) => {
    var accept = await checkRules(req.cookies);
    if(!accept.accessDateBase){
        res.status(403).send('Нет доступа');
        return;
    }

    req.url = req.url.replace(/^\/registrar_user\//, "");
    switch(req.url){
        case 'get_users':
            var info = {};
            info.users = await bd.get(`id->0`);
            info.chats = await bd.get_chat('all');
            var new_chats = [];
            await info.chats.forEach(chat => {
                new_chats.push({id: chat.id, name: chat.name, base: chat.base, members: chat.members})
            })
            info.chats = new_chats;

            res.status(200).send(info)
        break;
        case 'accept_user':
            if(!accept.acceptUser){
                res.status(403).send('Нет доступа');
                return;
            }

            var bot_settings = await bd.settings();
            var rule_text = bot_settings.rules;
            rule_text = rule_text.substring(1, rule_text.indexOf("]("));
            var rule_link = bot_settings.rules;
            rule_link = rule_link.substring(rule_link.indexOf("](") + "](".length, rule_link.indexOf(")"));

            res.bot.sendMessage(req.body.id, `Поздравляю, администрация одобрила твою заявку.\n\nТеперь прочитай правила и если тебя всё устраивает, то нажимай кнопку ниже`, {parse_mode: 'Markdown', reply_markup:{inline_keyboard: [[{text: rule_text, url: rule_link}],[{text: bot_settings.agreement_button, callback_data:'accept'}]]}})
            .then(async() => {
                await bd.set(`id==${req.body.id}`, 'registrar_type%=%2');
                res.status(200).send({ok: true});
            })
            .catch(err => {
                if (err.response && err.response.statusCode === 403){
                    res.status(200).send({ok: false});
                }
                res.status(500).send('Tg error');
            });
        break;
        case 'reset_user':
            if(!accept.requestRegistration){
                res.status(403).send('Нет доступа');
                return;
            }

            res.bot.sendMessage(req.body.id, 'Модерация просит Вас еще раз пройти регистрацию, возможно вы что-то ввели неправильно', {parse_mode: 'Markdown', reply_markup:{inline_keyboard: [[{text:'Зарегистрироваться',callback_data:'start_registrar'}]]}})
            .then(async() => {
                await bd.set(`id==${req.body.id}`, 'registrar_type%=%0')[0];
                res.status(200).send({ok: true});
            })
            .catch(err => {
                if (err.response && err.response.statusCode === 403){
                    res.status(403).send({ok: false});
                }
                res.status(500).send('Tg error');
            });
        break;
        case 'save_user':
            if(!accept.editDateBase){
                res.status(403).send('Нет доступа');
                return;
            }

            var data = req.body.data;
            var request = '';
            var start = true;
            for(var key in data){
                if(!start){
                    request+="%,%";
                }
                start = false;
                request+=`${key}%=%${data[key]||'none'}`;
            }
            await bd.set(`id==${req.body.id}`, request);
            res.status(200).send({ok: true});
        break;
        case 'del_user':
            if(!accept.editDateBase){
                res.status(403).send('Нет доступа');
                return;
            }
            await bd.del(`id==${req.body.id}`);
            res.status(200).send({ok: true});
        break;
        default:
            res.status(404).send('Error command')
        break;
    }
}