const
    md5 = require('md5'),
    bd = require('../../database');

module.exports = async (req, res) => {
    var settings = await bd.settings(); //настройки (нам нужен только id админа и список админов)

    //проверка на доступ
    if(md5(`ViPerCent_one_love_${settings.main_admin}`) != req.cookies.login){
        res.status(401).send('У Вас нет доступа к этой странице');
        return;
    }

    switch(req.params.link){
        case 'updateDate':
            for(var change in req.body.change){
                settings.additional_admins[req.body.id][change] = req.body.change[change];
            }
            await bd.settings({additional_admins: settings.additional_admins});
            res.status(200).send({ok: true});
            return;
        break;

        default:
            res.status(404).send('Я хз что тебе нужно');
    }
}