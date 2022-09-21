loadTeamList();

function loadTeamList(){
    var teamInfo = $('body').data('teaminfo');
    var needUsers = $('body').data('needusers');

    var html = '';


    let indexUser = 1
    teamInfo.teams.forEach((team, index) => {
        // console.log(team)
        html+=`
            <div class="team" data-index='${index}'>
                <input type="text" value="${team.name}">
                ${teamInfo.prize.length==0?'':`<span>${teamInfo.prize[index].place+1} место  ${teamInfo.prize[index].point}(б.)</span>`}
        `

        team.players.forEach(player => {

            needUsers.forEach((user) => {

                if(player == user?.id){
                    html+=`
                    <div class="user-card__wrap">
                      <p>${indexUser}</p>
                      <div class="user" data-info='${JSON.stringify(user)}'>

                          <img src="../registrar_user_img/${user.id}.jpg?v=0.0.2">
                          <div>
                              <span>${user.last_name} ${user.first_name}</span>
                          </div>
                      </div>
                    </div>

                    `
                    indexUser++
                }
            })
        })
        html+=`</div>`;
    })
    document.getElementById('teams').innerHTML = html;
}
