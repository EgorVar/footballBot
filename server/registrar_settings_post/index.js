const bd = require('../../database');
const md5 = require('md5');
const fs = require('fs');

module.exports = async (req, res) => {
    var bot_settings = await bd.settings();
    if(md5(`ViPerCent_one_love_${bot_settings.main_admin}`) != req.cookies.login){
        res.status(401).send('У Вас нет доступа к этой странице');
        return;
    }
    req.url = req.url.replace(/^\/registrar_settings\//, "");
    switch(req.url){
        case 'get_bot_settings':
            res.status(200).send(JSON.stringify(bot_settings));
        break;
        case 'save_question':
            if(req.body.delete === true){
                var old_control_question = bot_settings.control_question || [];
                var old_answer_control_question = bot_settings.answer_control_question || [];

                bot_settings.control_question = [];
                bot_settings.answer_control_question = [];

                old_control_question.forEach((item, index) => {
                    if(req.body.id != index){
                        bot_settings.control_question[bot_settings.control_question.length] = item;
                    }
                });
                old_answer_control_question.forEach((item, index) => {
                    if(req.body.id != index){
                        bot_settings.answer_control_question[bot_settings.answer_control_question.length] = item;
                    }
                });

                bot_settings = await bd.settings({control_question: bot_settings.control_question, answer_control_question: bot_settings.answer_control_question});
                res.status(200).send(JSON.stringify(bot_settings));
                return;
            }
            var question_id = req.body.id;
            var new_question = {text: req.body.text, answer: req.body.answer};
            var right_answer = req.body.right_answer;

            bot_settings.control_question[question_id] = new_question;
            bot_settings.answer_control_question[question_id] = right_answer;

            bot_settings = await bd.settings({control_question: bot_settings.control_question, answer_control_question: bot_settings.answer_control_question});
            res.status(200).send(JSON.stringify(bot_settings));
        break;
        case 'save_text':
            var change = {};
            change[req.body.type] = req.body.text;

            bot_settings = await bd.settings(change);
            res.status(200).send(JSON.stringify(bot_settings));
        break;
        case 'save_input':
            bot_settings = await bd.settings(req.body);
            res.status(200).send(JSON.stringify(bot_settings));
        break;
        case 'bot_snap_chat':
            bd.set(`id==${bot_settings.main_admin}`, `question%=%0`);
            res.bot.sendMessage(bot_settings.main_admin, 'Добавте меня в группу при помощи кнопки ниже', {reply_markup:{inline_keyboard: [[{text:'Добавить в группу',url:`https://t.me/${process.env.BOT_USERNAME}?startgroup=snap_chat`}]]}})
            res.status(200).send(JSON.stringify({ok: true}));
        break;
    }
}