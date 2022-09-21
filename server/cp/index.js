const 
    fs = require('fs'),
    mimeTypes = require('mime-types'),
    checkRules = require('../checkRules');

module.exports = async (req, res) => {
	var accept = await checkRules(req.cookies);
	if(!accept.accessDateBase){
		res.status(403).send('<center><h3 style="margin-top: 20%;">Лучше играйте в футбол</h3></center>');
		return;
	}
	
	var payPage = fs.readFileSync(`./server/cp/index.html`).toString();
    payPage = payPage.replace(/%%server_url%%/g, process.env.ADMIN_PAGES);
	res.status(200).send(payPage);
	// var page = fs.readFileSync(req.url).toString();
	// res.writeHead(200, {'Content-Type': mimeTypes.lookup(req.url)});
	// res.end(page);
    // if(req.url.indexOf("?") != -1){
        // req.url = req.url.substring(0, req.url.indexOf("?"));
    // }
    
    // if(req.url.indexOf("/registrar_user_img/") != -1){
        // req.url = req.url.replace(/^\/registrar_user_img\//, "./database/users_img/");
        // if(!fs.existsSync(req.url)){
            // res.status(404).send('Страница не найдена :(');
            // return;
        // }

        // res.writeHead(200, {'Content-Type': mimeTypes.lookup(req.url)});
        // res.end(fs.readFileSync(req.url));
        // return;
    // }



    // if((req.url.match(/\./g) || []).length==0){
        // if(req.url.match(/\/$/)){
            // req.url+='index'
        // }
        // req.url+='.html'
        // req.url = req.url;
    // }
    // if(req.url.indexOf("/cp/") != -1){
        // req.url = req.url.replace(/^\/registrar_user\//, "./server/cp/");
    // }
    // if(!fs.existsSync(req.url)){
        // res.status(404).send('Страница не найдена :(');
        // return;
    // }
    
    // var page = fs.readFileSync(req.url).toString();
    // page = page.replace(/%%hiddenMark%%/g, accept.viewMark?'':'style="display: none"');
    // page = page.replace(/%%hiddenAccept%%/g, accept.acceptUser?'flex':'none');
    // page = page.replace(/%%hiddenEdit%%/g, accept.editDateBase?'':'1');
    // page = page.replace(/%%hiddenReset%%/g, accept.requestRegistration?'flex':'none');
    
    // res.writeHead(200, {'Content-Type': mimeTypes.lookup(req.url)});
    // res.end(page);
}