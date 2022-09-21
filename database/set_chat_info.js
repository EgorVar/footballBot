const fs = require('fs');

module.exports = (id, data) => {
    if(!fs.existsSync(`./database/chat_info/${id}`)){
        return {ok: false};
    }

    var chat_data = fs.readFileSync(`./database/chat_info/${id}`);
    chat_data = JSON.parse(chat_data);

    for(var key in data){
        chat_data[key] = data[key];
    }

    fs.writeFileSync(`./database/chat_info/${id}`, JSON.stringify(chat_data));
    return chat_data;
}