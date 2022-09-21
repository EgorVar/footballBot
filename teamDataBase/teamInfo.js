const
    fs = require('fs'),
    log = require('./appendIntoLog');

module.exports = (teamId = String, newData = {}) => {
    if(!fs.existsSync(`./teamDataBase/teamInfo/${teamId}`)) return {ok: false};

    var data = fs.readFileSync(`./teamDataBase/teamInfo/${teamId}`);
    data = JSON.parse(data);
    data.ok = true;

    if(JSON.stringify(newData) != '{}'){
        for(var key in newData){
            if(key == 'permanentDate') continue;
            data[key] = newData[key];
        }

        fs.writeFileSync(`./teamDataBase/teamInfo/${teamId}`, JSON.stringify(data));
    }

    log(teamId, newData);
    return data;
}