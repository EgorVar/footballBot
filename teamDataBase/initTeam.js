const
    fs = require('fs'),
    log = require('./appendIntoLog');

var string = 'abcdefghijklmnopqrstuvwxyz0123456789';

if(!fs.existsSync('./teamDataBase/teamInfo/')){
    fs.mkdirSync('./teamDataBase/teamInfo/');
}

module.exports = (startData = {}) => {
    var teamId = '';
    var allTeams = fs.readdirSync('./teamDataBase/teamInfo/');
    while(1){
        for(var i = 0; i < 10; i++){
            teamId += string[Math.round(Math.random() * (string.length - 1))];
        }

        if(allTeams.indexOf(teamId) == -1) break;
    }
    
    
    var date = new Date();
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 180);

    var defaultData = {
        permanentDate: date.getTime(),
        rosterPlayers: [],
        teams: [{name:'Команда №1', players: []}],
        prize: []
    };

    for(var key in startData){
        if(key == 'permanentDate') continue;
        defaultData[key] = startData[key];
    }

    fs.writeFileSync(`./teamDataBase/teamInfo/${teamId}`, JSON.stringify(defaultData));
    log(teamId, defaultData);
    defaultData.id = teamId;
    return defaultData;
}