const fs = require('fs');

module.exports = (condition) => {
    if(!condition) return 'error';
    var logic_type_condition = {type: 0, index: 0};
    if(condition.indexOf("&&") != -1){
        logic_type_condition.type = 1;
        logic_type_condition.index = condition.indexOf("&&");
    }else if(condition.indexOf("||") != -1){
        logic_type_condition.type = 2;
        logic_type_condition.index = condition.indexOf("||");
    }

    var first_condition = condition;
    var second_condition = '';
    if(logic_type_condition.type != 0){
        first_condition = condition.substring(0, logic_type_condition.index);
        second_condition = condition.substring(logic_type_condition.index+2);
    }

    var first_type_condition = {type: 0, index: 0};
    if(first_condition.indexOf("==") != -1){
        first_type_condition.type = 1;
        first_type_condition.index = first_condition.indexOf("==");
    }else if(first_condition.indexOf("!=") != -1){
        first_type_condition.type = 2;
        first_type_condition.index = first_condition.indexOf("!=");
    }else if(first_condition.indexOf("->") != -1){
        first_type_condition.type = 3;
        first_type_condition.index = first_condition.indexOf("->");
    }else if(first_condition.indexOf(">=") != -1){
        first_type_condition.type = 4;
        first_type_condition.index = first_condition.indexOf(">=");
    }else if(first_condition.indexOf("<-") != -1){
        first_type_condition.type = 5;
        first_type_condition.index = first_condition.indexOf("<-");
    }else if(first_condition.indexOf("<=") != -1){
        first_type_condition.type = 6;
        first_type_condition.index = first_condition.indexOf("<=");
    }
    
    var second_type_condition = {type: 0, index: 0};
    if(second_condition.indexOf("==") != -1){
        second_type_condition.type = 1;
        second_type_condition.index = second_condition.indexOf("==");
    }else if(second_condition.indexOf("!=") != -1){
        second_type_condition.type = 2;
        second_type_condition.index = second_condition.indexOf("!=");
    }else if(second_condition.indexOf("->") != -1){
        second_type_condition.type = 3;
        second_type_condition.index = second_condition.indexOf("->");
    }else if(second_condition.indexOf(">=") != -1){
        second_type_condition.type = 4;
        second_type_condition.index = second_condition.indexOf(">=");
    }else if(second_condition.indexOf("<-") != -1){
        second_type_condition.type = 5;
        second_type_condition.index = second_condition.indexOf("<-");
    }else if(second_condition.indexOf("<=") != -1){
        second_type_condition.type = 6;
        second_type_condition.index = second_condition.indexOf("<=");
    }

    var key_first_condition = '';
    var value_first_condition = '';
    if(first_type_condition.type){
        key_first_condition = first_condition.substring(0, first_type_condition.index);
        value_first_condition = first_condition.substring(first_type_condition.index+2);
        if(!isNaN(value_first_condition)) value_first_condition = parseInt(value_first_condition);
        if(value_first_condition === 'true') value_first_condition = true;
        if(value_first_condition === 'false') value_first_condition = false;
    }

    var key_second_condition = '';
    var value_second_condition = '';
    if(second_type_condition.type){
        key_second_condition = second_condition.substring(0, second_type_condition.index);
        value_second_condition = second_condition.substring(second_type_condition.index+2);
        if(!isNaN(value_second_condition)) value_second_condition = parseInt(value_second_condition);
        if(value_second_condition === 'true') value_second_condition = true;
        if(value_second_condition === 'false') value_second_condition = false;
    }

    var users = [];
    var users_info = fs.readdirSync('./database/users_info');
    users_info.forEach(item => {
        var users_info_get = JSON.parse(fs.readFileSync(`./database/users_info/${item}`));
        var first_value = 0;
        first_condition = false;
        if(key_first_condition){
            first_value = users_info_get[key_first_condition];
        }
        switch(first_type_condition.type){
            case 1:
                first_condition = first_value==value_first_condition;
            break;
            case 2:
                first_condition = first_value!=value_first_condition;
            break;
            case 3:
                first_condition = first_value>value_first_condition;
            break;
            case 4:
                first_condition = first_value>=value_first_condition;
            break;
            case 5:
                first_condition = first_value<value_first_condition;
            break;
            case 6:
                first_condition = first_value<=value_first_condition;
            break;
        }
        var second_value = 0;
        second_condition = false;
        if(key_second_condition){
            second_value = users_info_get[key_second_condition];
        }
        switch(second_type_condition.type){
            case 1:
                second_condition = second_value==value_second_condition;
            break;
            case 2:
                second_condition = second_value!=value_second_condition;
            break;
            case 3:
                second_condition = second_value>value_second_condition;
            break;
            case 4:
                second_condition = second_value>=value_second_condition;
            break;
            case 5:
                second_condition = second_value<value_second_condition;
            break;
            case 6:
                second_condition = second_value<=value_second_condition;
            break;
        }
        if(logic_type_condition.type == 0){
            if(first_condition == true){
                fs.unlinkSync(`./database/users_info/${item}`);
            }
        }else if(logic_type_condition.type == 1){
            if(first_condition == true && second_condition == true){
                fs.unlinkSync(`./database/users_info/${item}`)
            }
        }else if(logic_type_condition.type == 2){
            if(first_condition == true || second_condition == true){
                fs.unlinkSync(`./database/users_info/${item}`)
            }
        }
    })
    return users;
}