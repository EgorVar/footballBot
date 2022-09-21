var bot_settings = {};
const xhr = new XMLHttpRequest();
var update = false;

xhr.open('POST', 'get_bot_settings', false);
xhr.send();
if (xhr.status != 200) {
    alert( xhr.status + ': ' + xhr.statusText );
}else{
    bot_settings = JSON.parse(xhr.responseText);
}

if(bot_settings.moderation_chat){
    document.getElementById('snap_chat').innerText = `Бот привязан к чату ${bot_settings.moderation_chat}`;
    document.getElementById('snap_chat').style.backgroundColor = '#90ee90';
}

var type_message = ['question_surname', 'question_name', 'question_patronymic', 'question_birthdate', 'question_link', 'question_phone', 'question_photo', 'text_successful_passage_registration', 'text_successful_passage_test', 'text_erroneous_passage_test', 'text_confirmation_information', 'text_links_on_chats'];
type_message.forEach((item, index) => {
    document.getElementById(`textarea_${index}`).value = bot_settings[item];
})

var type_input = ['rules', 'agreement_button', 'save_info'];
type_input.forEach((item, index) => {
    document.getElementById(`input_${index}`).value = bot_settings[item];
})

var type_pay_input = ['merchant_id', 'order_id', 'amount', 'secret_key'];
type_pay_input.forEach((item, index) => {
    document.getElementById(`input_pay_${index}`).value = bot_settings[item];
})

var all_button = document.getElementsByTagName('button');
all_button = Array.from(all_button);
all_button.forEach((item) => {
    if(item.id.indexOf("save_text_") != -1){
        item.onclick = (e) => {
            if(update){
                notification("#f08080", "Идет загрузка, подождите", 5000);
                return;
            }
            var id = e.target.id;
            id = id.replace("save_text_", "");
            id = parseInt(id);

            var save_type_text = type_message[id];
            var save_text = document.getElementById(`textarea_${id}`).value;
            var new_save_text = {type: save_type_text, text: save_text};
            new_save_text = JSON.stringify(new_save_text);
    
            update = true;
            xhr.open('POST', 'save_text')
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.onreadystatechange = async () => {
                if(xhr.readyState != 4)return;
                update = false;
                if (xhr.status != 200) {
                    alert( xhr.status + ': ' + xhr.statusText );
                }else{
                    bot_settings = JSON.parse(xhr.responseText);
                    notification("#90ee90", "Текст сохранен", 5000);
                }
            }
            xhr.send(new_save_text);
        }
    }
})

if(bot_settings.control_question.length > 0){
    questions_board(bot_settings.control_question, bot_settings.answer_control_question);
}

document.addEventListener("click", function (e) {
    var path = e.path;
    path = path[path.length-8];
    if(!path ){
        return
    }
    if(path.className == 'question'){
        if(update){
            notification("#f08080", "Идет загрузка, подождите", 5000);
            return;
        }
        var id = path.id;
        id = id.substring("question_".length);
        id = parseInt(id);
        questions_board(bot_settings.control_question, bot_settings.answer_control_question, id);
    }
});


edit_questions.onclick = () => {
    document.getElementById('settings').style.height = '0%';
    document.getElementById('settings').style.margin = '0';
    document.getElementById('settings').style.padding = '0';
    
    setTimeout(() => {
        document.getElementById('edit_settings').style.height = '100%';
        document.getElementById('edit_settings').style.overflow = 'auto';
    }, 500);
}

add_question.onclick = () => {
    var questions_board_el = document.getElementById('questions_board');
    var questions = document.getElementsByClassName('question');
    questions = Array.from(questions);

    var html = `<div class="edit_question">`;
    html+=`<input type="hidden" id="question_id" value="${questions.length}"><div class="text_question input"><span>Вопрос</span><input type="text" id="input_q"></div>`;
    html+=`<div class="answer input"><span>Ответ №1</span><input type="text" id="input_a_0"></div>`;
    html+=`<div class="right_answer input"><span>Правильный ответ</span><input type="number" id="input_r_q"></div><button id="add_answer">Добавить ответ</button><button id="save_question">Сохранить вопрос</button>`;
    html+=`</div>`;
    questions_board_el.insertAdjacentHTML('beforeend', html);

    add_answer.onclick = add_answer_f;
    save_question.onclick = save_question_f;
}

save_inputs.onclick = () => {
    var new_data = {rules: '', agreement_button: '', save_info: ''}

    var rules = document.getElementById('input_0').value;
    if(!rules){
        notification('#FF3366', 'Введите ссылку на правила', 5000);
        document.getElementById('input_0').focus();
        return;
    }
    if(!rules.match(/^\[/) || !rules.match(/\]\(/) || !rules.match(/\)$/)){
        notification('#FF3366', `Неправильно введены данные в "Правила"`, 5000);
        document.getElementById('input_0').focus();
        return;
    }
    var rule_text = rules;
    rule_text = rule_text.substring(1, rule_text.indexOf("]("));

    var rule_link = rules;
    rule_link = rule_link.substring(rule_link.indexOf("](") + "](".length, rule_link.indexOf(")"));
    
    if(!rule_text || !rule_link){
        notification('#FF3366', `Неправильно введены данные в "Правила"`, 5000);
        document.getElementById('input_0').focus();
        return;
    }
    new_data.rules = rules;

    var agreement_button = document.getElementById('input_1').value;
    if(!agreement_button){
        notification('#FF3366', 'Неправильно введены данные в "Согласие с правилами"', 5000);
        document.getElementById('input_1').focus();
        return;
    }
    new_data.agreement_button = agreement_button;

    var save_info = document.getElementById('input_2').value;
    if(!save_info){
        notification('#FF3366', 'Неправильно введены данные в "Подтвержение информиции"', 5000);
        document.getElementById('input_2').focus();
        return;
    }
    new_data.save_info = save_info;

    new_data= JSON.stringify(new_data);
    update = true;
    xhr.open('POST', 'save_input')
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = async () => {
        if(xhr.readyState != 4)return;
        update = false;
        if (xhr.status != 200) {
            alert( xhr.status + ': ' + xhr.statusText );
        }else{
            notification("#90ee90", "Кнопки сохранены", 5000);
        }
    }
    xhr.send(new_data);
}

save_pay_inputs.onclick = () => {
    var new_data = {};
    type_pay_input.forEach((item, index) => {
        new_data[item] = document.getElementById(`input_pay_${index}`).value;
    })
    new_data= JSON.stringify(new_data);
    update = true;
    xhr.open('POST', 'save_input')
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = async () => {
        if(xhr.readyState != 4)return;
        update = false;
        if (xhr.status != 200) {
            alert( xhr.status + ': ' + xhr.statusText );
        }else{
            notification("#90ee90", "Платежные данные сохранены", 5000);
        }
    }
    xhr.send(new_data);
}

snap_chat.onclick = () => {
    update = true;
    xhr.open('POST', 'bot_snap_chat')
    xhr.onreadystatechange = async () => {
        if(xhr.readyState != 4)return;
        update = false;
        if (xhr.status != 200) {
            alert( xhr.status + ': ' + xhr.statusText );
        }else{
            notification("#90ee90", "Проверь Telegram", 5000);
        }
    }
    xhr.send();
}


function questions_board(questions = Object, answer = Object, selected_id = Number = -1){
    document.getElementById('questions_board').innerHTML = '';
    questions.forEach((item, index) => {
        if(index == selected_id){
            var edit_question = document.createElement('div');
            edit_question.className = 'edit_question';

            var innerHTML = `<input type="hidden" id="question_id" value="${index}"><div class="text_question input"><span>Вопрос</span><input type="text" id="input_q" value="${item.text}"></div>`;
            item.answer.forEach((answer, index) => {
                innerHTML+=`<div class="answer input"><span>Ответ №${index+1}</span><input type="text" id="input_a_${index}" value="${answer}"></div>`;
            })
            innerHTML+=`<div class="right_answer input"><span>Правильный ответ</span><input type="number" id="input_r_q" value="${answer[index]}"></div><button id="add_answer">Добавить ответ</button><button id="save_question">Сохранить вопрос</button><button id="del_question">Удалить вопрос</button>`;
            edit_question.innerHTML = innerHTML;
            document.getElementById('questions_board').appendChild(edit_question);
            add_answer.onclick = add_answer_f;
            save_question.onclick = save_question_f;
            del_question.onclick = del_question_f;
            return;
        }
        var question = document.createElement('div');
        question.id = `question_${index}`;
        question.className = 'question';

        var right_answer = answer[index];
        var innerHTML = `<span>${item.text}</span>`;

        item.answer.forEach((answer, index) => {
            innerHTML+=`<div ${index+1==right_answer?'class="right"':''}>${answer}</div>`;
        })

        question.innerHTML = innerHTML;
        document.getElementById('questions_board').appendChild(question);
    })
}

function add_answer_f(){
    var element = document.getElementsByClassName('right_answer');
    element = Array.from(element)[0];
    var elements = document.getElementsByClassName('answer');
    elements = Array.from(elements);
    element.insertAdjacentHTML('beforeBegin', `<div class="answer input"><span>Ответ №${elements.length+1}</span><input type="text" id="input_a_${elements.length}"></div>`);
}

function save_question_f(){
    var question_text = document.getElementById('input_q').value;
    if(!question_text){
        notification('#FF3366', 'Введите вопрос', 5000);
        document.getElementById('input_q').focus();
        return;
    }
    var elements = document.getElementsByClassName('answer');
    elements = Array.from(elements);
    var answers = [];
    elements.forEach((item, index) => {
        var answer = document.getElementById(`input_a_${index}`).value;
        if(answer){
            answers[answers.length] = answer;
        }
    })

    if(answers.length == 0){
        notification('#FF3366', 'Введите хотя бы один ответ', 5000);
        document.getElementById('input_a_0').focus();
        return;
    }

    var right_answer = document.getElementById('input_r_q').value;
    if(!right_answer){
        notification('#FF3366', 'Укажите номер правильного ответа', 5000);
        document.getElementById('input_r_q').focus();
        return;
    }
    if(right_answer > answers.length || right_answer < 0){
        notification('#FF3366', 'Ответ введен неверно', 5000);
        document.getElementById('input_r_q').focus();
        return;
    }
    var question_id = document.getElementById('question_id').value;
    var new_question = {id: question_id, text: question_text, answer: answers, right_answer: right_answer};
    new_question = JSON.stringify(new_question);
    
    update = true;
    xhr.open('POST', 'save_question')
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = async () => {
        if(xhr.readyState != 4)return;
        update = false;
        if (xhr.status != 200) {
            alert( xhr.status + ': ' + xhr.statusText );
        }else{
            bot_settings = JSON.parse(xhr.responseText);
            notification("#90ee90", "Вопрос сохранен", 5000);
            questions_board(bot_settings.control_question, bot_settings.answer_control_question);
        }
    }
    xhr.send(new_question);
}

function del_question_f(){
    var question_id = document.getElementById('question_id').value;
    var new_question = {id: question_id, delete: true};
    new_question = JSON.stringify(new_question);
    
    update = true;
    xhr.open('POST', 'save_question')
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = async () => {
        if(xhr.readyState != 4)return;
        update = false;
        if (xhr.status != 200) {
            alert( xhr.status + ': ' + xhr.statusText );
        }else{
            bot_settings = JSON.parse(xhr.responseText);
            notification("#90ee90", "Вопрос удален", 5000);
            questions_board(bot_settings.control_question, bot_settings.answer_control_question);
        }
    }
    xhr.send(new_question);
}