const bd = require('../database');
const phrases = require('./../phrases');

module.exports = async (chat_info = Object) => {
    return await list_text(chat_info);
}

async function list_text(chat_info) {
    await list(chat_info);

    var team = bd.get(`${chat_info.id}_play==2&&${chat_info.id}_go==1`);

    console.log(team)
    var reserve = bd.get(`${chat_info.id}_play==1&&${chat_info.id}_go==1`);
    var not_going = bd.get(`${chat_info.id}_go==0`);
    var text = '';

    team.sort((a, b) => {
        if(a[`${chat_info.id}_base`] == true || b[`${chat_info.id}_base`] == true){
            if(a[`${chat_info.id}_base`] == true && b[`${chat_info.id}_base`] != true) return -1;
            if(a[`${chat_info.id}_base`] == true && b[`${chat_info.id}_base`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_base`] != true && b[`${chat_info.id}_base`] == true) return 1;
        }if(a[`${chat_info.id}_paidWithPriority`] == true || b[`${chat_info.id}_paidWithPriority`] == true){
            if(a[`${chat_info.id}_paidWithPriority`] == true && b[`${chat_info.id}_paidWithPriority`] != true) return -1;
            if(a[`${chat_info.id}_paidWithPriority`] == true && b[`${chat_info.id}_paidWithPriority`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_paidWithPriority`] != true && b[`${chat_info.id}_paidWithPriority`] == true) return 1;
        }else if(a[`${chat_info.id}_paid`] == true || b[`${chat_info.id}_paid`] == true){
            if(a[`${chat_info.id}_paid`] == true && b[`${chat_info.id}_paid`] != true) return -1;
            if(a[`${chat_info.id}_paid`] == true && b[`${chat_info.id}_paid`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_paid`] != true && b[`${chat_info.id}_paid`] == true) return 1;
        }else{
            return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
        }
    });

    reserve.sort((a, b) => {
        return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
    })

    not_going.sort((a, b) => {
        return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
    })

    const emo = phrases.string35_1;
    text += '*⚽️ Состав*\n';
    for(var i = 0; i < chat_info.game_limit_users;i++){
        if(team[i]){
            let emoji = null
            if(team[i][`${chat_info.id}_base`]) emoji = '❇️'
            if(team[i][`${chat_info.id}_paidWithPriority`]) emoji = '🟡'
            else if(team[i][`${chat_info.id}_paid`]) emoji = '✅'
            else emoji = '⚠️'



            text+=`*${i+1}.* ${i+1==8?'🎥':i+1==9?'🖥':i+1==10?'⚽️':''}${team[i][`personalEmoji`] || ''}${emoji}[${team[i].last_name} ${team[i].first_name}](tg://user?id=${team[i].id})\n`;
        }else{
            text+=`*${i+1}.* _Вакантное место_\n`;
        }
    }

    if (chat_info.stage == 'paid' || chat_info.stage == 'none') {
        return text;
    }

    text += '\n' + phrases.string33 + '\n';
    if (reserve.length == 0) {
        text += phrases.string34 + '\n';
    } else {
        reserve.forEach((item, index) => {
            text += `*${index + 1}.* [${item.last_name} ${item.first_name}](tg://user?id=${item.id})\n`;
        })
    }

    if (chat_info.stage == 'end' || chat_info.stage == 'none') {
        return text;
    }

    text += '\n' + phrases.string35 + '\n';
    if (not_going.length == 0) {
        text += phrases.string34 + '\n';
    } else {
        not_going.forEach((item, index) => {
            text += `*${index + 1}.* [${item.last_name} ${item.first_name}](tg://user?id=${item.id})\n`;
        })
    }

    return text;
}
async function list(chat_info) {
    if (chat_info.stage == 'end') return;

    var team = bd.get(`${chat_info.id}_play==2&&${chat_info.id}_go==1`);

    var users = await bd.get(`${chat_info.id}_go==1`);
    var old_team = [];
    await users.forEach(item => {
        if (item[`${chat_info.id}_play`] == 2) {
            old_team.push(item.id);
        }
        bd.set(`id==${item.id}`, `${chat_info.id}_play%=%1`);
    });

    team.sort((a, b) => {
        if(a[`${chat_info.id}_base`] == true || b[`${chat_info.id}_base`] == true){
            if(a[`${chat_info.id}_base`] == true && b[`${chat_info.id}_base`] != true) return -1;
            if(a[`${chat_info.id}_base`] == true && b[`${chat_info.id}_base`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_base`] != true && b[`${chat_info.id}_base`] == true) return 1;
        }if(a[`${chat_info.id}_paidWithPriority`] == true || b[`${chat_info.id}_paidWithPriority`] == true){
            if(a[`${chat_info.id}_paidWithPriority`] == true && b[`${chat_info.id}_paidWithPriority`] != true) return -1;
            if(a[`${chat_info.id}_paidWithPriority`] == true && b[`${chat_info.id}_paidWithPriority`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_paidWithPriority`] != true && b[`${chat_info.id}_paidWithPriority`] == true) return 1;
        }else if(a[`${chat_info.id}_paid`] == true || b[`${chat_info.id}_paid`] == true){
            if(a[`${chat_info.id}_paid`] == true && b[`${chat_info.id}_paid`] != true) return -1;
            if(a[`${chat_info.id}_paid`] == true && b[`${chat_info.id}_paid`] == true) return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
            if(a[`${chat_info.id}_paid`] != true && b[`${chat_info.id}_paid`] == true) return 1;
        }else{
            return a[`${chat_info.id}_time`] - b[`${chat_info.id}_time`];
        }
    });

    var time = new Date();
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + 180);
    for (var i = 0; i < users.length && i < chat_info.game_limit_users; i++) {
        if (old_team.indexOf(users[i].id) == -1) {
            bd.set(`id==${users[i].id}`, `${chat_info.id}_recording_time%=%${time.getTime()}`);
        }
        bd.set(`id==${users[i].id}`, `${chat_info.id}_play%=%2`);
    }
}
