const 
    fs = require('fs'),
    mimeTypes = require('mime-types'),
    checkRules = require('../checkRules');

module.exports = async (req, res) => {
    if(req.url.indexOf("?") != -1){
        req.url = req.url.substring(0, req.url.indexOf("?"));
    }
    
    if(req.url.indexOf("/registrar_user_img/") != -1){
        req.url = req.url.replace(/^\/registrar_user_img\//, "./database/users_img/");
        if(!fs.existsSync(req.url)){
            res.status(404).send('Страница не найдена :(');
            return;
        }

        res.writeHead(200, {'Content-Type': mimeTypes.lookup(req.url)});
        res.end(fs.readFileSync(req.url));
        return;
    }

    var accept = await checkRules(req.cookies);
    if(!accept.accessDateBase){
        res.status(403).send('У вас нет доступа');
        return;
    }

    if((req.url.match(/\./g) || []).length==0){
        if(req.url.match(/\/$/)){
            req.url+='index'
        }
        req.url+='.html'
        req.url = req.url;
    }
    if(req.url.indexOf("/registrar_user/") != -1){
        req.url = req.url.replace(/^\/registrar_user\//, "./server/registrar_user/");
    }
    if(!fs.existsSync(req.url)){
        res.status(404).send('Страница не найдена :(');
        return;
    }
    
    var page = fs.readFileSync(req.url).toString();
    page = page.replace(/%%hiddenMark%%/g, accept.viewMark?'':'style="display: none"');
    page = page.replace(/%%hiddenAccept%%/g, accept.acceptUser?'flex':'none');
    page = page.replace(/%%hiddenEdit%%/g, accept.editDateBase?'':'1');
    page = page.replace(/%%hiddenReset%%/g, accept.requestRegistration?'flex':'none');
    
    res.writeHead(200, {'Content-Type': mimeTypes.lookup(req.url)});
    res.end(page);
}