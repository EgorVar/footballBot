const fs = require('fs');

module.exports = async (id) => {
    if(id == 'all'){
        var chats = fs.readdirSync(`./database/chat_info/`);
        info = [];
        chats.forEach(item => {
            info[info.length] = JSON.parse(fs.readFileSync(`./database/chat_info/${item}`));
        })
        return info;
    }else if(!fs.existsSync(`./database/chat_info/${id}`)){
        return {ok: false};
    }else{
        var info = JSON.parse(fs.readFileSync(`./database/chat_info/${id}`));
        info.ok = true;
        return info;
    }
}