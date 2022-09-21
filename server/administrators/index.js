const
    fs = require('fs'),
    md5 = require('md5'),
    mime = require('mime-types'),
    bd = require('../../database');

module.exports = async (req, res) => {

    var settings = bd.settings(); //настройки (нам нужен только id админа и список админов)
    console.log(md5(`ViPerCent_one_love_${settings.main_admin}`))

    var needUsers = [];
    for(var user in settings.additional_admins){
		// console.log("========= user " + user)
		// console.log(await bd.get(`id==${user}`)[0].id)		
		if(await bd.get(`id==${user}`)[0]){ // Проверка на корректную запись (иногда undefined из-за отсутствия данных)
			needUsers.push(await bd.get(`id==${user}`)[0]);
		}
    }

    //удаление get параметров
    if(req.url.indexOf("?") != -1)
        req.url = req.url.substring(0, req.url.indexOf("?"));

    //проверка на доступ

    
    if(md5(`ViPerCent_one_love_${settings.main_admin}`) != req.cookies.login){
        res.status(401).send('У Вас нет доступа к этой странице');
        return;
    }

    //правка ссылки
    if((req.url.match(/\./) || []).length == 0){
        if(req.url.match(/\/$/)) req.url+='index';
        req.url+='.html'
    }

    //проверка на наличие
    req.url = req.url.replace(/^\/administrators\//, "./server/administrators/");
    if(!fs.existsSync(req.url)){
        res.status(404).send('Страница не найдена :(');
        return;
    }

    //передаем некоторые данные
    var page = fs.readFileSync(req.url).toString();
    page = page.replace('%%needusers%%', JSON.stringify(needUsers));
    page = page.replace('%%settings%%', JSON.stringify(settings.additional_admins));

    //отправка страницы 
    res.writeHead(200, {'Content-Type': mime.lookup(req.url)});
    res.end(page);
}