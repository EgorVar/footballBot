const fs = require('fs');

module.exports = (data) => {
    if(!fs.existsSync('./database/bot_settings')){
        var bot_settings = {
            main_admin: 430454430,
            moderation_chat: 0,
            additional_admins: {

            },
            control_question: [
                
            ],
            answer_control_question: [

            ]
        }
        fs.writeFileSync('./database/bot_settings', JSON.stringify(bot_settings));
    }

    if(!data || data.toString() !== '[object Object]'){
        return JSON.parse(fs.readFileSync('./database/bot_settings'));
    }
    
    var bot_settings = JSON.parse(fs.readFileSync('./database/bot_settings'));
    if(Array.isArray(bot_settings.additional_admins)) bot_settings.additional_admins = {};
    for(var key in data){
        bot_settings[key] = data[key];
    }
    fs.writeFileSync('./database/bot_settings', JSON.stringify(bot_settings));
    return JSON.parse(fs.readFileSync('./database/bot_settings'));
}