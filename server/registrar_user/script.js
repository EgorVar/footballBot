const
    search = document.getElementById('search'),
    delButton = document.getElementById('del'),
    saveButton = document.getElementById('save'),
    resetButton = document.getElementById('reset'),
    sortType = document.getElementById('sort_type'),
    mesInfo = document.getElementById('infoMessage'),
    mesEdit = document.getElementById('editMessage'),
    userTable = document.getElementById('userTable'),
    acceptButton = document.querySelector('#accept'),
    editStyle = document.querySelector('#editStyle'),
    resetStyle = document.querySelector('#resetStyle'),
    acceptStyle = document.querySelector('#acceptStyle'),
    mesEditDiv = document.querySelector('#editMessage > div');

var sort_user = -1
var users_info = [];
var chats_info = [];
var search_users_index = {};

//Получаем данные
var xhr = new XMLHttpRequest();
xhr.open('POST', 'get_users', false);
xhr.send();
if (xhr.status != 200) {
    alert(xhr.status + ': ' + xhr.statusText);
} else {
    var response = JSON.parse(xhr.responseText);
    users_info = response.users;
    chats_info = response.chats;

    var html = ``;
    chats_info.forEach((chat, index) => {
        html += `<option value="${index}base">Основа ${chat.name}</option><option value="${index}attendee">Участники ${chat.name}</option>`;
    })
    sortType.innerHTML += html;
}
table();

//Переходим к пользователю по ссылке
if (getAllUrlParams().id) {
    var userId = `#telegramId${getAllUrlParams().id}`;
    var element = document.querySelector(userId);
    if (element) {
        var destination = $(element).offset().top;
        $('html').animate({ scrollTop: destination - 5 }, 600);
        setTimeout(() => {
            search.className = 'hiddenSearch';
            $(element).css({ boxShadow: '0 0 5px red' });
        }, 650)
        setTimeout(() => { element.style.cssText = '' }, 15000)
    }
}

//Скрытие поиска
var last_scroll = window.scrollY;
document.addEventListener('scroll', () => {
    var scroll = Math.floor(window.scrollY);

    if (scroll <= 100 || last_scroll - scroll > 25) {
        search.className = '';
    } else if (scroll - last_scroll > 10) {
        search.className = 'hiddenSearch';
    }
    last_scroll = scroll;
})


//Обработка нажатий на пользователя
var selectUser = {};
var allSpan = [
    "#editMessage > div > button:nth-child(2) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(3) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(4) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(5) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(6) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(7) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(8) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(9) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(10) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(11) > span:nth-child(2)",
    "#editMessage > div > button:nth-child(12) > span:nth-child(2)",
];
var allSpan1 = {};
var nsmeSpan = ['mark', 'rating', 'games', 'first_name', 'last_name', 'patronymic', 'phone', 'vk_link', 'birthdate', 'personalEmoji', 'comment'];
allSpan.forEach((span, index) => {
    allSpan1[nsmeSpan[index]] = document.querySelector(span);
})
allSpan = allSpan1;
$(document).on('click', '#userTable tr', (evn) => {
    if (evn.target.tagName == 'A') return;

    var user = evn.target.closest('tr');
    user = $(user).data('userindex');
    selectUser.index = user;
    selectUser.info = user = users_info[user];

    oldData = '';
    for (var key in allSpan) {
        oldData += allSpan[key].innerText = user[key] != undefined ? user[key] : "нет";
    }

    saveButton.style.display = 'none';
    resetButton.style.display = `${user.registrar_type == 0 ? 'none' : resetStyle.value}`;
    acceptButton.style.display = `${user.registrar_type != 1 ? 'none' : acceptStyle.value}`;
    $(mesEdit).fadeIn(300);
    $(mesEditDiv).delay(150).slideDown(250);
    return false;
})
$(mesEditDiv).on('click', 'button#cansel', () => { $(mesEditDiv).slideUp(200); $(mesEdit).delay(100).fadeOut(250); })
$(saveButton).click((evn) => {
    var newData = {};
    var change = false
    for (var key in allSpan) {
        if (allSpan[key].innerText != selectUser.info[key] && allSpan[key].innerText != "нет") {
            newData[key] = allSpan[key].innerText;
            change = true;
        }
    }
    if (!change) return;


    xhr.open('POST', 'save_user', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({ id: selectUser.info.id, data: newData }));
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        if (JSON.parse(xhr.responseText).ok) {
            $(evn.target).slideUp(400);
            notification('#90ee90', 'Данные сохранены', 5000);
            oldData = '';
            for (var key in allSpan) {
                oldData += users_info[selectUser.index][key] = allSpan[key].innerText;
            }
            // Скрываем после изменения (11.09)
            $(mesEditDiv).slideUp(200);
            $(mesEdit).delay(100).fadeOut(250);
            table();
            var userId = `#telegramId${selectUser.info.id}`;
            var element = document.querySelector(userId);
            var destination = $(element).offset().top;
            $('html').animate({ scrollTop: destination - 5 }, 0);
        } else {
            notification('#f08080', 'Какая-то ошибка :(', 5000);
        }
    }
})
$(delButton).click(() => {
    xhr.open('POST', 'del_user', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    console.log(selectUser.info.id);
    xhr.send(JSON.stringify({ id: selectUser.info.id }));
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        if (JSON.parse(xhr.responseText).ok) {
            users_info.splice(selectUser.index, 1);
            notification('#90ee90', 'Пользователь удален', 5000);
            $(mesEditDiv).slideUp(200);
            $(mesEdit).delay(100).fadeOut(250);
            table();
        } else {
            notification('#f08080', 'Какая-то ошибка :(', 5000);
        }
    }
});
$(mesEditDiv).on('click', 'button', (evn) => {
    if (evn.target.id.indexOf('accept') == -1 && evn.target.id.indexOf('reset') == -1 && evn.target.id.indexOf('save') == -1 && evn.target.id.indexOf('cansel') == -1 && evn.target.id.indexOf('del') == -1) {
        if (editStyle.value) return false;
        var name = $(evn.target.closest('button')).data('name');
        var newText = prompt('Для изменения введите новый текст или нажмите \'Отмена\'', allSpan[name].innerText);
        if (newText == null) return;
        var digital = ['mark', 'rating', 'phone'];
        var maxORmin = {
            mark: {
                min: 1,
                max: 6
            },
            rating: {
                min: 0
            },
            phone: {

            }
        };
        if (digital.indexOf(name) != -1) {
            newText = parseInt(newText) || 0;
            if (maxORmin[name].min != undefined && newText < maxORmin[name].min) {
                newText = maxORmin[name].min;
            } else if (maxORmin[name].max != undefined && newText > maxORmin[name].max) {
                newText = maxORmin[name].max;
            }
        }

        allSpan[name].innerText = newText;
        return;
    }
    if (evn.target.id.indexOf('accept') == -1 && evn.target.id.indexOf('reset') == -1) return;

    xhr.open('POST', evn.target.id.indexOf('accept') != -1 ? 'accept_user' : 'reset_user', false);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify({ id: selectUser.info.id }));
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        if (JSON.parse(xhr.responseText).ok) {
            $(evn.target).slideUp(400);
            notification('#90ee90', 'Сообщение отправлено', 5000);
            selectUser.info.registrar_type = evn.target.id.indexOf('accept') != -1 ? 2 : 0;
            users_info[selectUser.index] = selectUser.info;
            table();
            var userId = `#telegramId${selectUser.info.id}`;
            var element = document.querySelector(userId);
            var destination = $(element).offset().top;
            $('html').animate({ scrollTop: destination - 5 }, 0);
        } else {
            notification('#f08080', 'Пользователь заблокировал меня', 5000);
        }
    }
});
var oldData;
setInterval(() => {
    var newData = '';
    for (var key in allSpan) {
        newData += allSpan[key].innerText;
    }
    if (newData != oldData) {
        $(saveButton).slideDown(400);
    } else {
        $(saveButton).slideUp(400);
    }
}, 1000);

//Обработка нажатий на пользователя (ссылка)
$(document).on('click', '#userTable tr a', (evn) => {
    if (evn.target.href.indexOf('#') == -1) return;
    var user = evn.target.closest('tr');
    user = $(user).data('userindex');
    user = users_info[user];

    var html;
    if (evn.target.href.indexOf('#chatInfo') != -1) {
        html = `
            <div>
                <h1>Группы с пользователем</h1>
                <ul>
        `;

        chats_info.forEach(chat => {
            if (chat.members.indexOf(user.id) != -1) html += `<li>${chat.name}</li>`
        })

        html += `
                </ul>
                <button>ОК</button>
            </div>
        `;
    } else {
        html = `
            <div>
                <h1>Основа в группах</h1>
                <ul>
        `;

        chats_info.forEach(chat => {
            if (chat.base.indexOf(user.id) != -1) html += `<li>${chat.name}</li>`
        })

        html += `
                </ul>
                <button>ОК</button>
            </div>
        `;
    }

    mesInfo.innerHTML = html;
    $(mesInfo).fadeIn(350);
    return false;
});
$(mesInfo).on('click', 'button', () => { $(mesInfo).fadeOut(200); })

//Создание таблицы пользователей
function table() {
    var sortResult = sort_users();

    var html = '';
    users_info.forEach((user, index) => {
        if ((sortResult || '').toString() == '[object Object]') {
            if (chats_info[sortResult.chatIndex][sortResult.type].indexOf(user.id) == -1) return;
        }
        var time = new Date();
        time.setTime(user.registration_date);

        var presenceChat = 0;
        var presenceChatBase = 0;
        chats_info.forEach(chat => {
            if (chat.members.indexOf(user.id) != -1) presenceChat++;
            if (chat.base.indexOf(user.id) != -1) presenceChatBase++;
        })

        html += `
            <tr data-userIndex='${index}' id="telegramId${user.id}">
                <td class="image"><img src="${user.photo ? `../registrar_user_img/${user.id}.jpg` : 'svg/boy.svg'}"></td>
                <td class="info"><span><img src="svg/user.svg">ФИО</span><span>${user.last_name} ${user.first_name} ${user.patronymic}</span></td>
                <td class="info"><span><img src="svg/telegram.svg">Телеграм</span><span>${user.domain ? `<a href="tg://resolve?domain=${user.domain}">${user.domain}</a>` : user.id}</span></td>
                <td class="info"><span><img src="svg/vk.svg">ВКонтакте</span><span><a href="https://vk.com/${user.vk_link.toString().substring(user.vk_link.toString().lastIndexOf('/') + 1)}" target="blank">${user.vk_link.toString().substring(user.vk_link.toString().lastIndexOf('/') + 1)}</a></span></td>
                <td class="info"><span><img src="svg/telephone.svg">Телефон</span><span><a href="tel:+${user.phone}">${user.phone}</a></span></td>
                <td class="info" ${document.getElementById('style').value}><span><img src="svg/grade.svg">Уровень</span><span>${user.mark}</span></td>
                <td class="info"><span><img src="svg/award.svg">Очки</span><span>${user.rating}</span></td>
                <td class="info"><span><img src="svg/ball.svg">Игры</span><span>${user.games}</span></td>
                <td class="info"><span><img src="svg/verification.svg">Статус</span><span>${user.registrar_type == 0 ? 'Не подавал заявки' : user.registrar_type == 1 ? 'Проверка модераторами' : user.registrar_type == 2 ? 'Проходит тест' : 'Данные подтверждены'}</span></td>
                <td class="info"><span><img src="svg/birthday-cake.svg">Дата рождения</span><span>${user.birthdate}</span></td>
                <td class="info"><span><img src="svg/calendar.svg">Дата регистрации</span><span>${user.registration_date == 0 ? '' : `${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()}`}</span></td>
                <td class="info"><span><img src="svg/chats.svg">Группы</span><span><a href="#chatInfo">${presenceChat}/${chats_info.length}</a></span></td>
                <td class="info"><span><img src="svg/cash.svg">Основа</span><span><a href="#baseInfo">${presenceChatBase}/${chats_info.length}</a></span></td>
                <td class="info"><span><img src="svg/chats.svg">Комментарий</span><span>${user.comment ? user.comment : "нет"}</span></td>
            </tr>
        `

        search_users_index[`${user.last_name} ${user.first_name} ${user.patronymic}`] = `
            <tr data-userIndex='${index}' id="telegramId${user.id}">
                <td class="image"><img src="${user.photo ? `../registrar_user_img/${user.id}.jpg` : 'svg/boy.svg'}"></td>
                <td class="info"><span><img src="svg/user.svg">ФИО</span><span>${user.last_name} ${user.first_name} ${user.patronymic}</span></td>
                <td class="info"><span><img src="svg/telegram.svg">Телеграм</span><span>${user.domain ? `<a href="tg://resolve?domain=${user.domain}">${user.domain}</a>` : user.id}</span></td>
                <td class="info"><span><img src="svg/vk.svg">ВКонтакте</span><span><a href="https://vk.com/${user.vk_link.toString().substring(user.vk_link.toString().lastIndexOf('/') + 1)}" target="blank">${user.vk_link.toString().substring(user.vk_link.toString().lastIndexOf('/') + 1)}</a></span></td>
                <td class="info"><span><img src="svg/telephone.svg">Телефон</span><span><a href="tel:+${user.phone}">${user.phone}</a></span></td>
                <td class="info" ${document.getElementById('style').value}><span><img src="svg/grade.svg">Уровень</span><span>${user.mark}</span></td>
                <td class="info"><span><img src="svg/award.svg">Очки</span><span>${user.rating}</span></td>
                <td class="info"><span><img src="svg/ball.svg">Игры</span><span>${user.games}</span></td>
                <td class="info"><span><img src="svg/verification.svg">Статус</span><span>${user.registrar_type == 0 ? 'Не подавал заявки' : user.registrar_type == 1 ? 'Проверка модераторами' : user.registrar_type == 2 ? 'Проходит тест' : 'Данные подтверждены'}</span></td>
                <td class="info"><span><img src="svg/birthday-cake.svg">Дата рождения</span><span>${user.birthdate}</span></td>
                <td class="info"><span><img src="svg/calendar.svg">Дата регистрации</span><span>${user.registration_date == 0 ? '' : `${Math.floor(time.getDate() / 10)}${time.getDate() % 10}.${Math.floor((time.getMonth() + 1) / 10)}${(time.getMonth() + 1) % 10}.${time.getFullYear()}`}</span></td>
                <td class="info"><span><img src="svg/chats.svg">Группы</span><span><a href="#chatInfo">${presenceChat}/${chats_info.length}</a></span></td>
                <td class="info"><span><img src="svg/cash.svg">Основа</span><span><a href="#baseInfo">${presenceChatBase}/${chats_info.length}</a></span></td>
				<td class="info"><span><img src="svg/chats.svg">Комментарий</span><span>${user.comment ? user.comment : "нет"}</span></td>
            </tr>
        `
    });
    userTable.innerHTML = html;
}

/*SEARCH*/
var input = document.getElementById("search_text");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("search_button").click();
    }
});

$("#search_button").click(() => {
    const search = $("#search_text").val();
    const arrayHtmls = [];
    for (var user in search_users_index) {
        if (user.indexOf(search) > -1) {
            const html = search_users_index[user];
            arrayHtmls.push(html)
        }
    }
    userTable.innerHTML = arrayHtmls;
});
/*SEARCH*/

//Получаем значения get запроса
function getAllUrlParams() {
    var queryString = window.location.href.split('?')[1]
    var obj = {};

    if (queryString) {
        queryString = queryString.split('#')[0];
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=');
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            paramName = paramName.toLowerCase();
            paramValue = paramValue.toLowerCase();
            if (obj[paramName]) {
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                if (typeof paramNum === 'undefined') {
                    obj[paramName].push(paramValue);
                }
                else {
                    obj[paramName][paramNum] = paramValue;
                }
            }
            else {
                obj[paramName] = paramValue;
            }
        }
    }
    return obj;
}


//Сортировка пользователей
function sort_users() {
    if (sortType.value.indexOf('base') != -1) {
        return { type: 'base', chatIndex: parseInt(sortType.value) };
    }
    if (sortType.value.indexOf('attendee') != -1) {
        return { type: 'members', chatIndex: parseInt(sortType.value) };
    }
    switch (sortType.value) {
        case '1':
            //Сортировка по оценки
            users_info.sort((a, b) => {
                return (a.mark - b.mark) * sort_user;
            })
            break;
        case '2':
            //Сортировка по рейтингу
            users_info.sort((a, b) => {
                return (a.rating - b.rating) * sort_user;
            })
            break;
        case '3':
            //Сортировка по проверке
            users_info.sort((a, b) => {
                return (a.registrar_type - b.registrar_type) * sort_user;
            })
            break;
        case '4':
            //Сортировка по дате регистрации
            users_info.sort((a, b) => {
                return (a.registration_date - b.registration_date) * sort_user;
            })
            break;
        case '5':
            //Сортировка по основе
            users_info.sort((a, b) => {
                var baseA = 0;
                var baseB = 0;
                chats_info.forEach(chat => {
                    if (chat.base.indexOf(a.id) != -1) baseA++;
                    if (chat.base.indexOf(b.id) != -1) baseB++;
                })
                return (baseA - baseB) * sort_user;
            })
            break;
    }
}