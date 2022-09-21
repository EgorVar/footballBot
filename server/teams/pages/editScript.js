message('hidden', '#prizeEdit');
message('hidden', '#placeEdit');
message('hidden', '#mobileEdit');

loadUserList();
loadTeamList();

function loadUserList() {
    var teamInfo = $('body').data('teaminfo');
    var needUsers = $('body').data('needusers');

    var html = '';
    needUsers.forEach(user => {
        var exists = true;
        teamInfo.teams.forEach(team => {
            if (!exists) return;
            if (team.players.indexOf(user.id) != -1) {
                exists = false;
            }
        })
        if (exists) {
            html += `
                <div class="user" data-info='${JSON.stringify(user)}'>
                    <img src="../registrar_user_img/${user.id}.jpg">
                    <div>
                        <span>${user.last_name} ${user.first_name}</span>
                    </div>
                </div>
            `
        }
    })

    document.getElementById('rosterPlayers').innerHTML = html;
}
function loadTeamList() {
    var teamInfo = $('body').data('teaminfo');
    var needUsers = $('body').data('needusers');

    var html = '';
    teamInfo.teams.forEach((team, index) => {
        html += `
            <div class="team" data-index='${index}'>
                <input type="text" value="${team.name}">
                ${teamInfo.prize.length == 0 ? '' : `<span>${teamInfo.prize[index].place + 1} место  ${teamInfo.prize[index].point}(б.)</span>`}
        `
        team.players.forEach(player => {
            needUsers.forEach(user => {
                if (player == user.id) {
                    html += `
                    <div class="user" data-info='${JSON.stringify(user)}'>
                        <img src="../registrar_user_img/${user.id}.jpg?v=0.0.2">
                        <div>
                            <span>${user.last_name} ${user.first_name}</span>
                        </div>
                    </div>
                    `
                }
            })
        })
        html += `</div>`;
    })
    document.getElementById('teams').innerHTML = html;
    document.getElementById('teamNumberSpan').innerText = teamInfo.teams.length;
}

$('#addTeamNumber').click(() => {
    var number = parseInt(document.getElementById('teamNumberSpan').innerText);
    document.getElementById('teamNumberSpan').innerText = ++number;
    updateTeams(number);
})
$('#downTeamNumber').click(() => {
    var number = parseInt(document.getElementById('teamNumberSpan').innerText);
    if (number == 1) return;
    document.getElementById('teamNumberSpan').innerText = --number;
    updateTeams(number);
})
var oldNumber = parseInt(document.getElementById('teamNumberSpan').innerText);
function updateTeams(number = Number) {
    var teamInfo = $('body').data('teaminfo');
    var needUsers = $('body').data('needusers');
    if (oldNumber == number) return;

    if (oldNumber > number) {
        var allDiv = document.querySelectorAll('#teams > div');
        allDiv = Array.from(allDiv);
        $(allDiv[allDiv.length - 1]).remove();
        var html = '';
        teamInfo.teams[teamInfo.teams.length - 1].players.forEach(player => {
            needUsers.forEach(user => {
                if (player == user.id) {
                    html += `
                    <div class="user" data-info='${JSON.stringify(user)}'>
                        <img src="../registrar_user_img/${user.id}.jpg">
                        <div>
                            <span>Оценка: ${user.mark}</span>
                            <span>Рейтинг: ${user.rating}</span>
                        </div>
                    </div>
                    `
                }
            })
        })
        document.getElementById('rosterPlayers').innerHTML += html;
        teamInfo.teams.splice(teamInfo.teams.length - 1, 1);
    }
    if (oldNumber < number) {
        $("#teams").append(`<div class="team" data-index='${number - 1}'><input type="text" value="Команда №${number}"></div>`);
        teamInfo.teams.push({ name: `Команда №${number}`, players: [] });
    }

    oldNumber = number;
}

$('.team > input').live('keyup', (evn) => {
    var teamInfo = $('body').data('teaminfo');
    var teamIndex = $(evn.target.closest('.team')).data('index');

    teamInfo.teams[teamIndex].name = evn.target.value;
})

$('#save').click(() => {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `${window.location.href.substring(0, window.location.href.indexOf('?'))}/saveTeamInfo`, false);
    xhr.setRequestHeader('Content-type', 'application/json');
    var teamInfo = $('body').data('teaminfo');
    teamInfo['chatId'] = Number(window.location.href.match(/chatId=([0-9-]+)/)[1]);
    xhr.send(JSON.stringify({ newDate: teamInfo }));
    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        window.location.replace(window.location.href.substring(0, window.location.href.indexOf('?'))+"?chatId="+teamInfo['chatId']);
    }
})

$(document).on('click', '#cansel', (env) => {
    message('hidden', `#${env.originalEvent.path[2].id}`);
    selectedPlayer = {};
})

let typeAutoSort = 1;
$('#autoSort').click(() => {
    // if (!confirm(`Текущие команды будет изменены по принципу №${typeAutoSort}, начать автосортировку?`)) return;
    var teamNumber = prompt('Введите количество команд для сортировки по методу №' + typeAutoSort, '');
    if (teamNumber == null) return;
    if (isNaN(teamNumber)) teamNumber = 2;
    teamNumber = +teamNumber;

    var teamInfo = $('body').data('teaminfo');
    var needUsers = $('body').data('needusers');

    // console.log({ typeAutoSort })

    switch (typeAutoSort) {
        case 1:
            needUsers.sort((a, b) => {
                return b.mark - a.mark;
            })
            typeAutoSort++;
            break;
        case 2:
            needUsers.sort((a, b) => {
                if (b.mark < a.mark) return -1;
                if (b.mark > a.mark) return 1;
                if (b.last_name < a.last_name) return -1;
                if (b.last_name > a.last_name) return 1;
                return 0;
            })
            typeAutoSort++;
            break;
        case 3:
            needUsers.sort((a, b) => {
                if (b.mark < a.mark) return -1;
                if (b.mark > a.mark) return 1;
                if (b.first_name < a.first_name) return -1;
                if (b.first_name > a.first_name) return 1;
                return 0;
            })
            typeAutoSort++;
            break;
        case 4:
            needUsers.sort((a, b) => {
                if (b.mark < a.mark) return -1;
                if (b.mark > a.mark) return 1;
                if (b.birthdate < a.birthdate) return -1;
                if (b.birthdate > a.birthdate) return 1;
                return 0;
            })
            typeAutoSort++;
            break;
        case 5:
            needUsers.sort((a, b) => {
                if (b.mark < a.mark) return -1;
                if (b.mark > a.mark) return 1;
                if (b.phone < a.phone) return -1;
                if (b.phone > a.phone) return 1;
                return 0;
            })
            typeAutoSort = 1;
            break;
    }

    teamInfo.teams = [];
    for (var i = 0; i < teamNumber; i++) {
        teamInfo.teams.push({ name: `Команда №${i + 1}`, players: [] });
    }

    var queue = 0;
    var increase = true;
    // var commands_temp = { 0: [], 1: [], 2: [] };
    needUsers.forEach(user => {
        // commands_temp[queue].push(`Игрок ${user.first_name} ${user.last_name} (баллы: ${user.mark})`);
        teamInfo.teams[queue].players.push(user.id);
        queue += increase ? 1 : -1;

        if (queue < 0 || queue >= teamInfo.teams.length) {
            increase = !increase;
            queue += increase ? 1 : -1;
        }
    });

    // console.log("=====================")
    // console.log("Метод сортировки №" + typeAutoSort - 1)
    // console.log("")
    // console.log(`Команда 1\n` + commands_temp[0].join("\n"));
    // console.log("")
    // console.log(`Команда 2\n` + commands_temp[1].join("\n"));
    // console.log("")
    // console.log(`Команда 3\n` + commands_temp[2].join("\n"));
    // console.log("=====================")


    $('body').data('teaminfo', teamInfo);
    loadUserList();
    loadTeamList();
})

$('#prize').click(() => {
    var teamInfo = $('body').data('teaminfo');
    if (teamInfo.prize.length == 0 && !confirm('После настройки изменять списки команд будет запрещено, настроить призовые?')) return;
    if (teamInfo.prize.length == 0) {
        for (var i = 0; i < teamInfo.teams.length; i++) {
            teamInfo.prize.push({});
        }
    }

    var allButtons = document.querySelectorAll('#prizeEdit button');
    allButtons.forEach(button => {
        if (button.id) return;
        $(button).remove();
    })

    teamInfo.teams.forEach((team, index) => {
        $('#prizeEdit #cansel').before(`<button onclick="editPlace(${index})">${team.name} ${!teamInfo.prize[index].point ? '' : ` - ${teamInfo.prize[index].place + 1} место, ${teamInfo.prize[index].point} балл(ов)`}</button>`);
    })

    message('view', '#prizeEdit');
})
function editPlace(teamIndex, place = false) {
    var teamInfo = $('body').data('teaminfo');

    if (place !== false) {
        var exists = false;
        teamInfo.prize.forEach((prize, index) => {
            if (exists || index == teamIndex || prize.place !== place) return;
            exists = true;
        });

        if (exists) {
            if (!confirm('Это место принадлежит другой команде, продолжить?')) return;
            teamInfo.prize.forEach((prize, index) => {
                if (prize.place !== place) return;
                teamInfo.prize[index] = {};
            });
        }

        var point = {
            2: {
                0: 4,
                1: 2,
            },
            3: {
                0: 5,
                1: 3,
                2: 1,
            },
            4: {
                0: 6,
                1: 4,
                2: 2,
                3: 1,
            },
        }

        teamInfo.prize[teamIndex] = { place: place, point: +prompt('Введите количество очков для этой команды', point[teamInfo.teams.length][place]) };
        message('hidden', '#placeEdit');
        $('#prize').click();
        return;
    }

    var allButtons = document.querySelectorAll('#placeEdit button');
    allButtons.forEach(button => {
        if (button.id) return;
        $(button).remove();
    })

    for (var i = 0; i < teamInfo.teams.length; i++) {
        $('#placeEdit #cansel').before(`<button onclick="editPlace(${teamIndex}, ${i})">${i + 1} место</button>`);
    }

    message('view', '#placeEdit');
}

function message(type, selector) {
    switch (type) {
        case 'view':
            $(selector).fadeIn(200);
            $(`${selector} > div`).delay(100).slideDown(200);
            break;

        case 'hidden':
            $(`${selector} > div`).slideUp(200);
            $(selector).delay(100).fadeOut(200);
            break;

        default:
            console.error(`type error`);
    }
}

if ($('body').data('teaminfo').prize.length == 0) {
    document.getElementById('autoSort').hidden = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.onclick = onClick;
    } else {
        document.onmousedown = onMouseDown;
        document.onmousemove = onMouseMove;
        document.onmouseup = onMouseUp;
    }
}

var selectedPlayer = {};
function onClick(evn) {
    var element = evn.target.closest('.user');
    if (!element) return;
    selectedPlayer = element;

    var existsTeam = 0;
    var userInfo = $(element).data('info');
    var teamInfo = $('body').data('teaminfo');
    var allButtons = document.querySelectorAll('#mobileEdit > div > button');
    allButtons.forEach(button => {
        if (button.id) return;
        $(button).remove();
    })
    teamInfo.teams.forEach((team, index) => {
        if (team.players.indexOf(userInfo.id) != -1) {
            existsTeam++;
            return;
        }
        $('#cansel').before(`<button onclick="selectTeam(${index})">${team.name}</button>`);
    })
    if (existsTeam) $('#mobileEdit > div > h1').after(`<button onclick="selectTeam(-1)">Без команды</button>`);
    message('view', '#mobileEdit');
}
function selectTeam(teamIndex) {
    var teamInfo = $('body').data('teaminfo');
    var userInfo = $(selectedPlayer).data('info');

    teamInfo.teams.forEach((team, index) => {
        if (team.players.indexOf(userInfo.id) == -1) return;
        teamInfo.teams[index].players.splice(team.players.indexOf(userInfo.id), 1);
    })

    if (teamIndex == -1) {
        document.getElementById('rosterPlayers').append(selectedPlayer);
        message('hidden', '#mobileEdit');
        return;
    }

    teamInfo.teams[teamIndex].players.push(userInfo.id);
    var allTeams = document.querySelectorAll('.team');
    allTeams.forEach(team => {
        var index = $(team).data('index');
        if (index == teamIndex) {
            team.append(selectedPlayer)
        }
    })
    message('hidden', '#mobileEdit');
}

var dragElement = {};
function onMouseDown(evn) {
    if (evn.which != 1) return;

    var element = evn.target.closest('.user');
    if (!element) return;

    dragElement.downX = evn.pageX;
    dragElement.downY = evn.pageY;
    dragElement.element = element;
}
function onMouseMove(evn) {
    if (!dragElement.element) return;

    if (!dragElement.start) {
        var moveX = evn.pageX - dragElement.downX;
        var moveY = evn.pageY - dragElement.downY;
        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) return false;

        var coords = getCoords(dragElement.element);
        dragElement.shiftY = dragElement.downY - coords.top;
        dragElement.shiftX = dragElement.downX - coords.left;

        dragElement.element.style.zIndex = 9999;
        dragElement.element.style.position = 'absolute';

        dragElement.start = true;
    }

    dragElement.element.style.top = evn.pageY - dragElement.shiftY + 'px';
    dragElement.element.style.left = evn.pageX - dragElement.shiftX + 'px';

    dragElement.element.style.display = 'none';
    var teamElement = document.elementFromPoint(evn.clientX, evn.clientY);
    dragElement.element.style.display = 'flex';

    if (teamElement == null) return false;
    teamElement = teamElement.closest('.team');

    if (!teamElement) {
        var allTeam = document.querySelectorAll('.team');
        allTeam = Array.from(allTeam);
        allTeam.forEach(team => {
            team.style.cssText = '';
        })
        return false;
    }
    teamElement.style.boxShadow = '0 0 10px #0054ff';

    return false;
}
function onMouseUp(evn) {
    if (!dragElement.element) return;

    dragElement.element.style.display = 'none';
    var teamElement = document.elementFromPoint(evn.clientX, evn.clientY);
    dragElement.element.style.display = 'flex';

    if (teamElement == null) return false;

    var teamInfo = $('body').data('teaminfo');
    var userInfo = $(dragElement.element).data('info');
    teamInfo.teams.forEach((team, index) => {
        if (team.players.indexOf(userInfo.id) == -1) return;
        teamInfo.teams[index].players.splice(team.players.indexOf(userInfo.id), 1);
    })
    dragElement.element.style.cssText = '';
    if (teamElement.closest('.team')) {
        var user = teamElement.closest('.user');
        if (user) {
            var target = user.getBoundingClientRect();
            var y = evn.clientY - target.top;
            if (y < 90) {
                user.before(dragElement.element);
            } else {
                user.after(dragElement.element)
            }
        } else {
            teamElement.closest('.team').append(dragElement.element)
        }

        var userList = [];
        var teamIndex = $(teamElement.closest('.team')).data('index');
        var elements = Array.from(teamElement.closest('.team').childNodes);
        elements.forEach(element => {
            if (element.className != 'user') return;
            var userInfo = $(element).data('info');
            userList.push(userInfo.id);
        })

        var teamInfo = $('body').data('teaminfo');
        teamInfo.teams[teamIndex].players = userList;
    } else {
        document.getElementById('rosterPlayers').append(dragElement.element);
    }

    dragElement = {};
    $(dragElement.element).remove()

    var allTeam = document.querySelectorAll('.team');
    allTeam = Array.from(allTeam);
    allTeam.forEach(team => {
        team.style.cssText = '';
    })
}

function getCoords(elem) {
    var box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    }
}