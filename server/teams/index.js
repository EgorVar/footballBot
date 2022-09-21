const
    fs = require('fs'),
    md5 = require('md5'),
    bd = require('../../database'),
    teams = require('../../teamDataBase'),
    checkRules = require('../checkRules');

module.exports = async (req, res) => {
    var teamId = req.params.teamId;
    if (teamId.indexOf('.') !== -1) {
        if (!fs.existsSync(`./server/teams/pages/${teamId}`)) {
            var errorPage = fs.readFileSync('./server/teams/pages/error.html').toString();
            errorPage = errorPage.replace("%%errorTitle%%", 'Такой страницы нет :(');
            errorPage = errorPage.replace("%%errorMessage%%", 'Возможно ты неправильно указал ссылку, проверь ее и попробуй еще раз');
            res.status(404).send(errorPage);
            return;
        }
        var mime_type = teamId.search(/.html$/) != -1 ? 'text/html' : teamId.search(/.css$/) != -1 ? 'text/css' : teamId.search(/.js$/) != -1 ? 'text/javascript' : teamId.search(/.jpg$/) != -1 ? 'image/jpeg' : 'text/plain';
        res.writeHead(200, { 'Content-Type': mime_type });
        res.end(fs.readFileSync(`./server/teams/pages/${teamId}`));
        return;
    }

    var teamInfo = teams.get(teamId);
    if (!teamInfo.ok) {
        var errorPage = fs.readFileSync('./server/teams/pages/error.html').toString();
        errorPage = errorPage.replace("%%errorTitle%%", 'Такой команды нет :(');
        errorPage = errorPage.replace("%%errorMessage%%", 'Команда которую вы указали еще не существует, проверьте правильность данных');
        res.status(200).send(errorPage);
        return;
    }

    var needUsers = [];
    await teamInfo.rosterPlayers.forEach(async (user) => {
        needUsers.push(await bd.get(`id==${user}`)[0]);
    })

    var type = req.query.type || 'view';
    var chatId = req.query.chatId;
    var { name:chatName } = await bd.get_chat(chatId);
    var time = new Date(teamInfo.permanentDate);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
    time = `${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()}`
    // console.log('#########################', req.cookies)
    var accept = await checkRules(req.cookies);
    if (!accept.editTeam) type = 'view';

    switch (type) {
        case 'view':
            var viewPage = fs.readFileSync('./server/teams/pages/view.html').toString();
            viewPage = viewPage.replace("%%chatName%%", chatName);
            viewPage = viewPage.replace("%%eventDate%%", time);
            viewPage = viewPage.replace("%%teamInfo%%", JSON.stringify(teamInfo));
            viewPage = viewPage.replace("%%needUsers%%", JSON.stringify(needUsers));
            viewPage = viewPage.replace("%%helpPanel%%", accept.editTeam ? '<div id="helpPanel"><button onclick="window.location.replace(`${window.location.href}&type=edit`)">Изменить</button></div>' : '');
            viewPage = viewPage.replace("%%teamsStyle%%", accept.editTeam ? `` : 'style="margin-top: 10px;"');
            res.status(200).send(viewPage);
            break;

        case 'edit':
            var editPage = fs.readFileSync('./server/teams/pages/edit.html').toString();
            editPage = editPage.replace("%%chatName%%", chatName);
            editPage = editPage.replace("%%eventDate%%", time);
            editPage = editPage.replace("%%teamInfo%%", JSON.stringify(teamInfo));
            editPage = editPage.replace("%%needUsers%%", JSON.stringify(needUsers));
            res.status(200).send(editPage);
            break;

        default:
            var errorPage = fs.readFileSync('./server/teams/pages/error.html').toString();
            errorPage = errorPage.replace("%%errorTitle%%", 'Неизвестный тип работы');
            errorPage = errorPage.replace("%%errorMessage%%", 'Возможно вы неправильно указали тип работы, удалите его и попробуйте еще раз');
            res.status(200).send(errorPage);
    }
}
