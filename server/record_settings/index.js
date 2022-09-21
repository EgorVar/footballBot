const
    fs = require('fs'),
    checkRules = require('../checkRules');

module.exports = async (req, res) => {
    var accept = await checkRules(req.cookies);

    // console.log(accept)
    if(!accept.editChatSettings){
        res.status(403).send('У вас нет доступа');
        return;
    }

    if(req.url.indexOf("?") != -1){
        req.url = req.url.substring(0, req.url.indexOf("?"));
    }
    if((req.url.match(/\./g) || []).length==0){
        if(req.url.match(/\/$/)){
            req.url+='index'
        }
        req.url+='.html'
        req.url = req.url;
    }
    req.url = req.url.replace(/^\/record_settings\//, "./server/record_settings/");
    if(!fs.existsSync(req.url)){
        res.status(404).send('Страница не найдена :(');
        return;
    }

    var url = req.url;
    var mime_type = url.search(/.html$/)!=-1?'text/html':url.search(/.css$/)!=-1?'text/css':url.search(/.js$/)!=-1?'text/javascript':'text/plain';
    res.writeHead(200, {'Content-Type': mime_type});
    res.end(fs.readFileSync(url));
}
