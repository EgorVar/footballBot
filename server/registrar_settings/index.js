const bd = require('../../database');
const md5 = require('md5');
const fs = require('fs');

module.exports = (req, res) => {
    var bot_settings = bd.settings();
    if(req.url.indexOf("?") != -1){
        req.url = req.url.substring(0, req.url.indexOf("?"));
    }
    if(md5(`ViPerCent_one_love_${bot_settings.main_admin}`) != req.cookies.login){
        res.status(401).send('У Вас нет доступа к этой странице');
        return;
    }
    if((req.url.match(/\./g) || []).length==0){
        if(req.url.match(/\/$/)){
            req.url+='index'
        }
        req.url+='.html'
        req.url = req.url;
    }
    req.url = req.url.replace(/^\/registrar_settings\//, "./server/registrar_settings/");
    if(!fs.existsSync(req.url)){
        res.status(404).send('Страница не найдена :(');
        return;
    }

    var url = req.url;
    var mime_type = url.search(/.html$/)!=-1?'text/html':url.search(/.css$/)!=-1?'text/css':url.search(/.js$/)!=-1?'text/javascript':'text/plain';
    res.writeHead(200, {'Content-Type': mime_type});
    res.end(fs.readFileSync(url));
}