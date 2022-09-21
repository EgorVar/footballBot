const
    md5 = require('md5'),
    bd = require('../database');

module.exports = async (cookies = Object) => {
    if(!cookies) cookies = {login: ''};
    // console.log(md5(`ViPerCent_one_love_${user}`))

    var allAdmins = await bd.settings();
    allAdmins = allAdmins.additional_admins;
// console.log('allAdmins',allAdmins)
// console.log('cookies.login',cookies.login)
    // console.log(cookies)
//     for(var user in allAdmins){
// // console.log('md5(`ViPerCent_one_love_${user}`)',md5(`ViPerCent_one_love_${user}`))
//         if(md5(`ViPerCent_one_love_${user}`) == cookies.login){
//
//             if(user == allAdmins.main_admin){
//               console.log(md5(`ViPerCent_one_love_${user}`))
//                 allAdmins[user].main_admin = true;
//             }
// // console.log('allAdmins[user]',allAdmins[user])
//             return allAdmins[user];
//         }
//     }


    return {editChatSettings: true}
}
