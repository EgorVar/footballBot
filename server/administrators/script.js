var request = {};
var title = document.getElementsByClassName('title')[0];
var selectAdmin = document.getElementById('selectAdmin');
var selectAdminId = document.querySelector("#selectAdminId");
var selectAdminSpan = document.querySelector("#selectAdmin > div:nth-child(1) > span");
var selectAdminImg = document.querySelector("#selectAdmin > div:nth-child(1) > div > img");

window.onload = () => {
    var allUsers = $('body').data('needusers');
    var allAdmins = document.getElementById('allAdmins');
    allUsers.forEach(user => {
        allAdmins.insertAdjacentHTML('beforeend', `<div class="admin" data-user='${JSON.stringify(user)}'><div><img src="../registrar_user_img/${user.id}.jpg"></div><div><span>${user.last_name} ${user.first_name}</span></div></div>`)
    })
}

//Просмотр/Сохранение информации
$(document).on('click', '.admin', (evn) => {
    var element = evn.originalEvent.path[evn.originalEvent.path.length-6];
    var userInfo = $(element).data('user');
    var settings = $('body').data('settings')[userInfo.id];

    selectAdminId.value = userInfo.id;
    selectAdminImg.src = `../registrar_user_img/${userInfo.id}.jpg`;
    selectAdminSpan.innerText = `${userInfo.last_name} ${userInfo.first_name}`;

    for(var input in allInputs){
        allInputs[input].checked = false;
    }
    for(var right in settings){
        allInputs[right].checked = settings[right];
    }

    $(selectAdmin).animate({width: '100%'}, 400);
    $(title).html('<img src="arrow.svg"> Права админов');
})
$(document).on('click', '.title', () => {
    if(title.innerHTML != '<img src="arrow.svg"> Права админов') return;

    $(selectAdmin).animate({width: '0'}, 200);
    $(title).html('Администраторы');

    var change = {};
    var changeWas = false;
    var settings = $('body').data('settings')[selectAdminId.value];
    for(var input in allInputs){
        if(allInputs[input].checked != settings[input]){
            changeWas = true;
            change[input] = allInputs[input].checked;
            settings[input] = allInputs[input].checked;
        }
    }

    if(!changeWas) return;
    
    request[selectAdminId.value] = new XMLHttpRequest();
    request[selectAdminId.value].open("POST", `updateDate`);
    request[selectAdminId.value].setRequestHeader('Content-type', 'application/json');
    request[selectAdminId.value].onreadystatechange = () => {
        if(request[selectAdminId.value].readyState != 4)return;
        
        if(request[selectAdminId.value].status != 200){
            alert(request[selectAdminId.value].status + ': ' + request[selectAdminId.value].statusText);
        }
    }
    request[selectAdminId.value].send(JSON.stringify({id: selectAdminId.value, change: change}));
})


//Переключатели прав
var allInputs = {};
document.querySelectorAll('div.button input').forEach(input => {
    allInputs[input.id] = input;
})
$(document).on('change', 'div.button input', (evn) => {
    var element = evn.target;

    if(element.id == 'accessDateBase' && element.checked == false){
        var inputs = ['viewMark', 'editDateBase', 'acceptUser', 'requestRegistration'];
        inputs.forEach(input => {
            allInputs[input].checked = false;
        })
    }
    if((element.id == 'viewMark' || element.id == 'editDateBase' || element.id == 'acceptUser' || element.id == 'requestRegistration') && element.checked == true){
        allInputs['accessDateBase'].checked = true;
    }
})