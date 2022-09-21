$('.load').fadeOut(0);
$('#saveInfo').fadeOut(0);
$('#parametersСhat').hide(0);

const xhr = new XMLHttpRequest();
xhr.open('POST', 'get_chats', false);
xhr.send();
if (xhr.status != 200) {
    alert(xhr.status + ': ' + xhr.statusText);
} else {
    JSON.parse(xhr.responseText).forEach(item => {
        document.getElementById('chatList').innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

var oldText = '', upload = false, chatId = Number, chatInfo = Object, chatUsers = Object;
var parametersTeaxtarea = [
    'text_notification',
    'text_record_start',
    'text_record_end',
    'text_pay',
    'text_users_list',
    'text_game_info',
    'text_change_list',
    'text_game_info1',
];
var parametersSelect = [
    'game_day', // data-index="0" Выбор дня
    'paid_online', // data-index="1" Выбор способа оплаты
    'paid_online_white', // data-index="2" Выбор типа оплаты
];

/* DEBUG:
var inputs = document.querySelectorAll('.parameterСhat input');
inputs = Array.from(inputs);
*/
var skip_inputs_checkbox = [0, 1, 2]; // Work 0, Block 1, Rating 2
var parametersInput = [
    '', // data-index="0" Время начала, отдельно
    '', // data-index="1" Время окончания, отдельно
    'game_limit_users', // data-index="2" Размер списка
    'game_waiting_time', // data-index="3" Ожидание
    'game_notification_time', // data-index="4" Уведомление
    'game_paid_time', // data-index="5" Оплата состава
    'game_paid1_time', // data-index="6" Оплата резерва
    'auto_change_value', // data-index="7" Возврат на онлайн-оплату через
    'merchantID', // data-index="8" ID Магазина
    'secretWord', // data-index="9" Секретное слово
    'orderID', // data-index="10" ID основного билета
    'amount', // data-index="11" Цена основного билета
    'orderID1', // data-index="12" ID специального билета
    'amount1', // data-index="13" Цена специального билета
    'priority', // data-index="14" Приоритет беседы
    'feedback_url' // data-index="15" URL для оценки игроков
];
// При добавлении новых инпутов инкремент ограничению в 3-х местах (последний элемент data-index + 2 (work & block)) (искать по "сгенерированные инпуты")
const MAX_CHECKED_INPUT =
    parametersInput.length
    - 1 // Вычитаем лишний индекс массива (т.к. отсчёт в parametersInput с 0)
    + skip_inputs_checkbox.length; // Добавляем пропуск Work и Block

$('#uploadChat').click(() => {
    chatId = document.getElementById('chatList').value;
    chatId = parseInt(chatId);

    xhr.open('POST', 'get_info', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({ id: chatId }));
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
        return;
    } else {
        chatInfo = JSON.parse(xhr.responseText)
        if (chatInfo.ok == false) {
            alert('Попробуй еще раз');
            return
        }
        document.title = `Настройки записи в "${chatInfo.name}"`;
    }

    var textareas = document.querySelectorAll('.parameterСhat textarea');
    textareas = Array.from(textareas);
    textareas.forEach(textarea => {
        oldText += textarea.value = chatInfo[parametersTeaxtarea[$(textarea).data('index')]];
    });

    var selects = document.querySelectorAll('.parameterСhat select');
    selects = Array.from(selects);
    selects.forEach(select => {
        oldText += select.value = chatInfo[parametersSelect[$(select).data('index')]];
    })

    var inputs = document.querySelectorAll('.parameterСhat input');
    inputs = Array.from(inputs);
    inputs.forEach((input, index) => {
        if(skip_inputs_checkbox.includes(index)) return; // Work, Block, Rating
        if (index > MAX_CHECKED_INPUT) return; // Выше идут сгенерированные инпуты с локального рейтинга
        if (index == 3 || index == 4) {
            oldText += input.value = `${chatInfo[`game_${index == 4 ? 'end' : 'start'}_hour`]}:${chatInfo[`game_${index == 4 ? 'end' : 'start'}_minute`]}`;
            return
        }
        oldText += input.value = chatInfo[parametersInput[$(input).data('index')]];
    })

    document.getElementById('work').checked = chatInfo.work;
    document.getElementById('block').checked = chatInfo.block;
    document.getElementById('rating').checked = chatInfo.rating;
    // document.getElementById('paid_auto').checked = chatInfo.set_auto;
    // if(chatInfo.set_auto){
    // $(".manually").hide();
    // }else{
    // $(".automatically").hide();
    // }

    $('#saveInfo').fadeOut(0);
    $('#selectChat').hide(400);
    $('#parametersСhat').delay(500).show(400);
});

$('#parametersСhat').on('click', 'div > span.span', evn => {
    var data = $(evn.target).data('param') || false;
    var element = evn.originalEvent.path[1];
    if ($(element).height() >= document.documentElement.clientHeight - 20) {
        element.style.cssText = '';
    } else {
        if (data) element.style.height = `unset`;
        // element.style.minHeight = `${document.documentElement.clientHeight - 20}px`;
        element.style.cssText = `overflow: auto; min-height: ${document.documentElement.clientHeight - 20}px`;
        $('html').delay(200).animate({ scrollTop: element.offsetTop - (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 10 : 20) }, 400);
        if ($(evn.target).data('function') == 'showUsers') showUsers(element);
        if ($(evn.target).data('function') == 'showUsersRatings') showUsersRatings(element);
    }
});

let baseDate = '--:--';
var oldNumber = ['', ''];
$('#parametersСhat').on('keyup', 'div > input.date', evn => {
    var number = evn.target.value.replace(/[^\d]/g, '');
    var index = $(evn.target).data('index');
    number = Array.from(number);

    if (evn.keyCode == 8 && number.length > 0 && number.length == oldNumber[index].length) number.splice(number.length - 1, 1);
    oldNumber[index] = number;

    var hours = +`${number[0] || 0}${number[1] || 0}`;
    var minutes = +`${number[2] || 0}${number[3] || 0}`;
    if (hours > 23) {
        number[0] = '0';
        number[1] = '0';
    }
    if (minutes > 59) {
        number[2] = '0';
        number[3] = '0';
    }

    var text = '';
    baseDate = Array.from(baseDate);
    var i = 0;
    baseDate.forEach(item => {
        if (item != ':' && number[i]) {
            text += number[i];
            i++;
            return
        }
        text += item;
    })
    evn.target.value = text;
    return false;
})

$('#work').click((evn) => {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }

    upload = true;
    xhr.open("POST", `set_text`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        }
    }
    xhr.send(JSON.stringify({ id: chatId, newData: { work: evn.target.checked, stage: 'none' } }));
})

$('#block').click((evn) => {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }

    upload = true;
    xhr.open("POST", `set_text`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        }
    }
    xhr.send(JSON.stringify({ id: chatId, newData: { block: evn.target.checked } }));
})

$('#rating').click((evn) => {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }

    upload = true;
    xhr.open("POST", `set_text`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        }
    }
    xhr.send(JSON.stringify({ id: chatId, newData: { rating: evn.target.checked } }));
})

/*
$('#paid_auto').click((evn) => {
    if(upload){
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }

    upload = true;
    xhr.open("POST", `set_auto`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4)return;

        upload = false;
        if(evn.target.checked){
            $(".manually").hide();
            $(".automatically").show();
        }else{
            $(".manually").show();
            $(".automatically").hide();
        }
        if(xhr.status != 200){
            alert(xhr.status + ': ' + xhr.statusText);
        }
    }
    document.querySelector('[data-index="13"]').value = 15;
    // $(".alert").text("Режим переключится через 15 мин");
    xhr.send(JSON.stringify({id: chatId, newData: {set_auto: evn.target.checked, min_edit_mode: 15, paid_online: false}}));
})
*/

$('.userInfo').live('click', evn => {
    if (evn.target.tagName == "BUTTON" || evn.target.tagName == "INPUT") return;

    var element = evn.originalEvent.path[evn.originalEvent.path.length - 8];
    var href = $(element).data('href') || '';
    if (href && confirm('Открыть страницу с информацией об этом пользователи?')) {
        window.open(href, '_blank');
    }
})

$('#deleteChat').click(() => {
    if (!confirm('Вы точно хотите удалить чат?')) return;

    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    xhr.open("POST", `delete_chat`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            window.location.reload();
        }
    }
    xhr.send(JSON.stringify({ id: chatId }));
})

$('#saveInfo').click(() => {
    if (upload) {
        alert('Идет загрузка, подождите');
        return
    }
    var oldText1 = '';
    var newData = {};
    var textareas = document.querySelectorAll('.parameterСhat textarea');
    textareas = Array.from(textareas);
    textareas.forEach(textarea => {
        if (textarea.value != chatInfo[parametersTeaxtarea[$(textarea).data('index')]]) {
            newData[parametersTeaxtarea[$(textarea).data('index')]] = chatInfo[parametersTeaxtarea[$(textarea).data('index')]] = textarea.value;
        }
        oldText1 += textarea.value;
    });

    var selects = document.querySelectorAll('.parameterСhat select');
    selects = Array.from(selects);
    selects.forEach(select => {

        if (select.value != chatInfo[parametersSelect[$(select).data('index')]]) {
            newData[parametersSelect[$(select).data('index')]] = chatInfo[parametersSelect[$(select).data('index')]] = select.value;
        }
        oldText1 += select.value;
    });

    var inputs = document.querySelectorAll('.parameterСhat input');
    inputs = Array.from(inputs);
    inputs.forEach((input, index) => {
        if(skip_inputs_checkbox.includes(index)) return; // Work, Block, Rating
        if (index > MAX_CHECKED_INPUT) return; // Выше идут сгенерированные инпуты с локального рейтинга
        if (index == 3 || index == 4) {
            input.value = input.value.replace('-', '0');
            var hours = +input.value.substring(0, input.value.indexOf(':'));
            var minutes = +input.value.substring(input.value.indexOf(':') + 1);
            if (hours != chatInfo[`game_${index == 4 ? 'end' : 'start'}_hour`]) newData[`game_${index == 4 ? 'end' : 'start'}_hour`] = chatInfo[`game_${index == 4 ? 'end' : 'start'}_hour`] = hours;
            if (minutes != chatInfo[`game_${index == 4 ? 'end' : 'start'}_minute`]) newData[`game_${index == 4 ? 'end' : 'start'}_minute`] = chatInfo[`game_${index == 4 ? 'end' : 'start'}_minute`] = minutes;
            oldText1 += input.value;
            return;
        }
        var value = input.value;
        if (input.type == 'number') {
            value = +value;
        }
        if (value != chatInfo[parametersInput[$(input).data('index')]]) {
            newData[parametersInput[$(input).data('index')]] = chatInfo[parametersInput[$(input).data('index')]] = value;
        }
        oldText1 += input.value;
    });
    newData = { id: chatId, newData: newData };
    newData = JSON.stringify(newData);
    upload = true;
    xhr.open("POST", `set_text`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        oldText = oldText1;
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            alert('Все готово');
        }
    }
    xhr.send(newData);
});

setInterval(() => {
    var newText = '';
    var textareas = document.querySelectorAll('.parameterСhat textarea');
    textareas = Array.from(textareas);
    textareas.forEach(textarea => {
        newText += textarea.value;
    });

    var selects = document.querySelectorAll('.parameterСhat select');
    selects = Array.from(selects);
    selects.forEach(select => {
        newText += select.value;
    });

    var inputs = document.querySelectorAll('.parameterСhat input');
    inputs = Array.from(inputs);
    inputs.forEach((input, index) => {
        if(skip_inputs_checkbox.includes(index)) return; // Work, Block, Rating
        if (index > MAX_CHECKED_INPUT) return; // Выше идут сгенерированные инпуты с локального рейтинга

        newText += input.value;
    });



    if (newText != oldText) {
        $('#saveInfo').fadeIn(400);
    } else {
        $('#saveInfo').fadeOut(400);
    }
}, 5000);

function showUsers(element){
    if(upload){
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `get_users`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4)return;

        upload = false;
        $('.load').fadeOut(400);
        if(xhr.status != 200){
            alert(xhr.status + ': ' + xhr.statusText);
        }else{
            chatUsers = JSON.parse(xhr.responseText);
            if(chatUsers.length == 0){
                alert('Пользователей нет, возможно нужно подождать обновление их списка');
                element.style.cssText = '';
                return;
            }

            chatUsers.sort((a, b) => {
                if(chatInfo.base.indexOf(a.id) != -1 && chatInfo.base.indexOf(b.id) == -1) return -1;
                if((chatInfo.base.indexOf(a.id) != -1 && chatInfo.base.indexOf(b.id) != -1) || (chatInfo.base.indexOf(a.id) == -1 && chatInfo.base.indexOf(b.id) == -1)){
                    // if(chatInfo.discount.indexOf(a.id) != -1 && chatInfo.discount.indexOf(b.id) == -1) return -1;
                    // if(chatInfo.discount.indexOf(a.id) == -1 && chatInfo.discount.indexOf(b.id) != -1) return 1;
                    return 0;
                }
                if(chatInfo.base.indexOf(a.id) == -1 && chatInfo.base.indexOf(b.id) != -1) return 1;
            });
// Здесь
            var html = '';
            chatUsers.forEach(item => {
                console.log(item)

                let statusPrice = 'ordinaryPrice'
                let statusPlayer = 'nonPaidUser'

                if(chatInfo.base.indexOf(item.id)!=-1) statusPlayer = 'baseUser'
                if(chatInfo?.nonPaidWithPriority?.indexOf(item.id)!=-1) statusPlayer = 'nonPaidUserWithPriority'

                if(chatInfo.discount.indexOf(item.id)!=-1) statusPrice = 'discountPrice'
                if(chatInfo.individualPrice.indexOf(item.id)!=-1 && statusPlayer !== 'baseUser' ) statusPrice = 'individualPrice'



                let buttonDiscount = null
                switch (statusPrice) {
                  case 'ordinaryPrice':
                    buttonDiscount = `<button onclick="changeDiscount(${item.id})" style="background-color: rgba(255, 69, 0, 0.8); text-shadow: 0 0 1px black;">💰</button>`
                    break;

                  case 'discountPrice':
                    buttonDiscount = `<button onclick="changeDiscount(${item.id})" style="background-color: rgba(255, 215, 0, 0.8); text-shadow: 0 0 1px black;">💰</button>`
                    break;

                  case 'individualPrice':
                    buttonDiscount = `<button onclick="changeDiscount(${item.id})" style="background-color: #A0E1D9; text-shadow: 0 0 1px black;">💰</button> <input class="individual-price" data-id="${item.id}" onChange="changeIndividualPrice(${item.id}, this.value)"  type="text" placeholder="${item?.individual_price ? (item.individual_price + '₽') : 'Цена'}"/>`
                    break;
                }

                let buttonBase = null

                switch (statusPlayer) {
                  case 'baseUser':
                    buttonBase = `<button onclick="changeBase(${item.id})" style="background-color: rgba(50, 205, 50, 0.8); text-shadow: 0 0 1px black;">❇️</button>`
                    break;
                  case 'nonPaidUser':
                    buttonBase = `<button onclick="changeBase(${item.id})" style="background-color: rgba(255, 215, 0, 0.8); text-shadow: 0 0 1px black;">❇️</button>`
                    break;
                  case 'nonPaidUserWithPriority':
                    buttonBase = `<button onclick="changeBase(${item.id})" style="background-color: #A0E1D9; text-shadow: 0 0 1px black;">❇️</button>`
                    break;
                }

                html+=`
                  <div class="userInfo" data-href="../registrar_user/?id=${item.id}">
                    <div class="img">
                      <img src="../registrar_user_img/${item.id}.jpg?v=0.0.2">
                    </div>
                    <span>${item.last_name} ${item.first_name}</span>
                    <div class="buttons">
                      ${buttonBase}
                      ${buttonDiscount}
                      <button onclick="deleteUser(${item.id})">❌</button>
                    </div>
                  </div>`

            });
            document.getElementById('users').innerHTML = html;
        }
    }
    xhr.send(JSON.stringify({id: chatId}));
}


function showUsersRatings(element) {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `get_users_ratings`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        $('.load').fadeOut(400);
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            chatUsersRating = JSON.parse(xhr.responseText);
            if (chatUsersRating.length == 0) {
                alert('Пользователей с рейтингом нет, возможно нужно подождать обновление их списка');
                element.style.cssText = '';
                return;
            }

            var html = '';
            chatUsersRating.forEach((item, index) => [
                html += `<div class="card">
                <div class="card-header" style="background-image: url(../registrar_user_img/${item.user}.jpg?v=0.0.2); background-size: contain; background-repeat: no-repeat;"></div>
                <div class="card-body" style="padding-top: 20px;">
                    <h2 class="name">${item.name}</h2>
                    <h4 class="job-title">Место: ${index + 1}</h4>
                </div>

                <div class="stats">
                    <div class="stat">
                        <span class="label">Рейтинг</span>
                        <span class="value"><input type="number" class="rating" style="width: 55px; font-size: 20px; font-weight: bold;" value="${item.data.rating}"></span>
                    </div>
                    <div class="stat">
                        <span class="label">Игры</span>
                        <span class="value"><input type="number" class="games" style="width: 55px; font-size: 20px; font-weight: bold;" value="${item.data.games}"></span>
                    </div>
                </div>
                <center><button style="background-color: rgb(5, 61, 0, 0.6);margin-top: 20px;width: 100px; font-weight: bold; color:white;" id="editUser" data-user="${item.user}">Изменить</button></center>
            </div>`
            ]);
            document.getElementById('ratings').innerHTML = html;
        }
    }
    xhr.send(JSON.stringify({ id: chatId }));
}

$('#editUser').live('click', event => {
    const element = event.originalEvent.path[0];
    const card = event.originalEvent.path[2];
    const user = $(element).data('user') || '';
    const rating = $(card).find('.rating').val();
    const games = $(card).find('.games').val();


    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `set_users_ratings`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            $('.load').fadeOut(400);
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            var response = JSON.parse(xhr.responseText);
            if (response.ok !== true) {
                $('.load').fadeOut(400);
                alert('Ой, какая-то ошибка :(');
                return;
            }
            showUsersRatings();
        }
    }
    xhr.send(JSON.stringify({ chatId, user, rating, games }));

})
// function pay_method(userId) {
//     if (upload) {
//         alert('Идет загрузка, подождите');
//         element.style.cssText = '';
//         return;
//     }
//     upload = true;
//     $('.load').fadeIn(400);
//     xhr.open("POST", `pay_method`);
//     xhr.setRequestHeader('Content-type', 'application/json');
//     xhr.onreadystatechange = () => {
//         if (xhr.readyState != 4) return;

//         upload = false;
//         if (xhr.status != 200) {
//             $('.load').fadeOut(400);
//             alert(xhr.status + ': ' + xhr.statusText);
//         } else {
//             var response = JSON.parse(xhr.responseText);
//             if (response.ok !== true) {
//                 $('.load').fadeOut(400);
//                 alert('Ой, какая-то ошибка :(');
//                 return;
//             }
//             showUsers();
//         }
//     }
//     xhr.send(JSON.stringify({ id: chatId, user_id: userId }));
// }

function unbanUser(userId) {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `unban_user`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            $('.load').fadeOut(400);
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            var response = JSON.parse(xhr.responseText);
            if (response.ok !== true) {
                $('.load').fadeOut(400);
                alert('Ой, какая-то ошибка :(');
                return;
            }
            showUsers();
        }
    }
    xhr.send(JSON.stringify({ id: chatId, user_id: userId }));
}

function changeBase(userId){
    if(upload){
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `set_base`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4)return;

        upload = false;
        if(xhr.status != 200){
            $('.load').fadeOut(400);
            alert(xhr.status + ': ' + xhr.statusText);
        }else{
            var response = JSON.parse(xhr.responseText);
            if(response.ok !== true){
                $('.load').fadeOut(400);
                alert('Ой, какая-то ошибка :(');
                return;
            }



            chatInfo.base = response.base;
            chatInfo.nonPaidWithPriority = response.nonPaidWithPriority;
            chatInfo.individualPrice = response.individualPrice;
            showUsers();
        }
    }
    xhr.send(JSON.stringify({id: chatId, user_id: userId}));
}

function changeDiscount(userId){
    if(upload){
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `set_discount`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;

        upload = false;
        if(xhr.status != 200){
            $('.load').fadeOut(400);
            alert(xhr.status + ': ' + xhr.statusText);
        }else{
            var response = JSON.parse(xhr.responseText);
            if(response.ok !== true){
                $('.load').fadeOut(400);
                alert('Ой, какая-то ошибка :(');
                return;
            }


            chatInfo.discount = response.discount;
            chatInfo.individualPrice = response.individualPrice;
            showUsers();
        }
    }
    xhr.send(JSON.stringify({id: chatId, user_id: userId}));
}

function changeIndividualPrice(userId, value) {


  if(upload){
      alert('Идет загрузка, подождите');
      element.style.cssText = '';
      return;
  }
  upload = true;

  $('.load').fadeIn(400);
  xhr.open("POST", `change_individual_price`);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onreadystatechange = () => {
      if(xhr.readyState != 4)return;

      upload = false;
      if(xhr.status != 200){
          $('.load').fadeOut(400);
          alert(xhr.status + ': ' + xhr.statusText);
      }else{
          var response = JSON.parse(xhr.responseText);
          if(response.ok !== true){
              $('.load').fadeOut(400);
              alert('Ой, какая-то ошибка :(');
              return;
          }


          showUsers();


          chatInfo.individualPriceUser = response.individualPrice
      }
  }
  xhr.send(JSON.stringify({id: userId, value}));

}

function deleteUser(userId) {
    if (upload) {
        alert('Идет загрузка, подождите');
        element.style.cssText = '';
        return;
    }
    upload = true;
    $('.load').fadeIn(400);
    xhr.open("POST", `del_user`);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return;

        upload = false;
        if (xhr.status != 200) {
            $('.load').fadeOut(400);
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            var response = JSON.parse(xhr.responseText);
            if (response.ok !== true) {
                $('.load').fadeOut(400);
                alert('Ой, какая-то ошибка :(');
                return;
            }

            chatInfo.members = response.members;
            showUsers();
        }
    }
    xhr.send(JSON.stringify({ id: chatId, user_id: userId }));
}
