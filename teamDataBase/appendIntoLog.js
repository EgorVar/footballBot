const 
    fs = require('fs')
    values = {
        'permanentDate': 'Скрытая дата изменена на',
        'changeableDate': 'Публичная дата изменена на',
        'rosterPlayers': 'Список игроков изменен на',
        'teams': 'Список команд изменен на',
        'prize': 'Призовые изменены на'
    };

if(!fs.existsSync('./teamDataBase/teamLog/')){
    fs.mkdirSync('./teamDataBase/teamLog/');
}

module.exports = (teamId = String, data = Object) => {
    var text = "";
    var date = new Date();
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 180);
    var textDate = `${Math.floor(date.getHours()/10)}${date.getHours()%10}:${Math.floor(date.getMinutes()/10)}${date.getMinutes()%10}:${Math.floor(date.getSeconds()/10)}${date.getSeconds()%10} ${Math.floor(date.getDate()/10)}${date.getDate()%10}.${Math.floor((date.getMonth()+1)/10)}${(date.getMonth()+1)%10}.${date.getFullYear()}`;

    if(!fs.existsSync(`./teamDataBase/teamLog/${teamId}`)) text+=`╔═════════════════════╗\n║    СОЗДАНИЕ ЛОГА    ║\n║                     ║\n║ ${textDate} ║\n╚═════════════════════╝\n\n`;
    if(JSON.stringify(data) == '{}') text+=`Просмотр информации в ${textDate}\n`;

    for(var key in data){
        text+=`${textDate}  `
        if(values[key]){
            text+=`${values[key]} ${JSON.stringify(data[key])}`;
        }else{
            text+=`Изменение ${key} на ${JSON.stringify(data[key])}`;
        }
        text+='\n';
    }
    
    fs.appendFileSync(`./teamDataBase/teamLog/${teamId}`, text);
}


