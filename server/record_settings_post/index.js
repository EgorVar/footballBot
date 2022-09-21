const
    fs = require('fs'),
    bd = require('../../database'),
    checkRules = require('../checkRules'),
    sendNotification = require('../sendNotification')


module.exports = async (req, res) => {
    var accept = await checkRules(req.cookies);
    if (!accept.editChatSettings) {
        res.status(403).send('У вас нет доступа');
        return;
    }

    req.url = req.url.replace(/^\/record_settings\//, "");
    switch (req.url) {
        case 'get_chats':
            res.status(200).send(JSON.stringify(await bd.get_chat('all')));
            break;
        case 'get_info':
            var info = await bd.get_chat(req.body.id);
            res.status(200).send(JSON.stringify(info));
            break;
        case 'set_text':
            bd.set_chat(req.body.id, req.body.newData);
            res.status(200).send({ ok: true });
            break;
        case 'get_users':
            var users = await bd.get_chat(req.body.id) || [];
            users = users.members || [];

            var sendUsers = [];
            for (var i = 0; i < users.length; i++) {
                var user = await bd.get(`id==${users[i]}`)[0];
                sendUsers.push(user);
            }
            res.status(200).send(sendUsers);
            break;
        case 'get_users_ratings':
            let all_users = await bd.get(`registrar_type==3`);
            let usersRating = [];
            let chatInfoRatingsGet = fs.readFileSync(`./database/chat_info_ratings/${req.body.id}`);
            chatInfoRatingsGet = JSON.parse(chatInfoRatingsGet);

            chatInfoRatingsGet.sort((a, b) => {
                return b.data.rating - a.data.rating;
            })

            chatInfoRatingsGet.forEach(async (user) => {
                try {
                    const full_user_info = all_users.find(a => a.id === user.userId);
                    usersRating.push({ user: user.userId, name: full_user_info.first_name + " " + full_user_info.last_name, data: user.data });
                } catch (error) { }
            });

            res.status(200).send(usersRating);
            break;
        case 'set_users_ratings':
            const fileName = `./database/chat_info_ratings/${req.body.chatId}`;
            let chatInfoRatingsSet = fs.readFileSync(fileName, 'utf-8');
            chatInfoRatingsSet = JSON.parse(chatInfoRatingsSet);
            const { data } = chatInfoRatingsSet.find(a => a.userId == req.body.user);
            
            if(+req.body.rating != 0 && +req.body.games != 0){
                data.rating = +req.body.rating;
                data.games = +req.body.games;                
            }else{
                const pos = chatInfoRatingsSet.findIndex(a => a.userId == req.body.user);
                chatInfoRatingsSet.splice(pos, 1);    
            }
            fs.writeFileSync(fileName, JSON.stringify(chatInfoRatingsSet));
            res.status(200).send({ok: true});
            break;
        case 'unban_user':
            var user = await bd.get(`id==${req.body.user_id}`)[0];

            if (user[`${req.body.id}_ban_until`] >= Date.now()) {
                await bd.set(`id==${req.body.user_id}`, `${req.body.id}_ban_until%=%0`);
            }
            res.status(200).send({ ok: true });
            break;
        // case 'pay_method':
        //     var user = await bd.get(`id==${req.body.user_id}`)[0];

        //     if (user[`${req.body.id}_pay_method`] != "qiwi") {
        //         await bd.set(`id==${req.body.user_id}`, `${req.body.id}_pay_method%=%qiwi`);
        //     }else{
        //         await bd.set(`id==${req.body.user_id}`, `${req.body.id}_pay_method%=%0`);
        //     }
        //     res.status(200).send({ ok: true });
        //     break;
        
        case 'set_base':
            var base_users = await bd.get_chat(req.body.id);
            var nonPaidWithPriority = base_users.nonPaidWithPriority || []
            var individual_price_users = base_users.individualPrice || [];
            base_users = base_users.base || [];

            // 1 - base -
            // 2 - base null
            // 3 - nonPaidWithPriority -

            if(base_users.indexOf(req.body.user_id) != -1 && nonPaidWithPriority.indexOf(req.body.user_id) == -1) {

              var new_base_users = [];
              base_users.forEach(item => {
                  if(item != req.body.user_id) new_base_users.push(item)
              })

              base_users = new_base_users
            } else if(base_users.indexOf(req.body.user_id) == -1 && nonPaidWithPriority.indexOf(req.body.user_id) == -1) {
              nonPaidWithPriority.push(req.body.user_id)
            } else {
              // to base
              base_users.push(req.body.user_id)

              var newNonPaidWithPriority = [];
              nonPaidWithPriority.forEach(item => {
                  if(item != req.body.user_id) newNonPaidWithPriority.push(item)
              })

              nonPaidWithPriority = newNonPaidWithPriority


              var new_individual_price_users = []
              individual_price_users.forEach(item => {
                if(item != req.body.user_id) new_individual_price_users.push(item)
              })

              individual_price_users = new_individual_price_users


            }






            await bd.set_chat(req.body.id, {base: base_users});
            await bd.set_chat(req.body.id, {nonPaidWithPriority: nonPaidWithPriority});
            await bd.set_chat(req.body.id, {individualPrice: individual_price_users});
            res.status(200).send({ok: true, base: base_users, nonPaidWithPriority, individualPrice: individual_price_users});
        break;
        case 'set_discount':

            var discount_users = await bd.get_chat(req.body.id);
            individual_price_users = discount_users.individualPrice || [];
            base_user = discount_users.base || [];
            discount_users = discount_users.discount || [];


            if((discount_users.indexOf(req.body.user_id) == -1) && (individual_price_users.indexOf(req.body.user_id) == -1)){

              discount_users.push(req.body.user_id);
            } else if ((discount_users.indexOf(req.body.user_id) != -1) && (individual_price_users.indexOf(req.body.user_id) == -1) && (base_user.indexOf(req.body.user_id) == -1)){
              individual_price_users.push(req.body.user_id)

              var new_discount_users = [];
              discount_users.forEach(item => {
                  if(item != req.body.user_id) new_discount_users.push(item)
              });

              discount_users = new_discount_users;
            }else{

              var new_discount_users = [];
              var new_individual_price_users = [];
              discount_users.forEach(item => {
                  if(item != req.body.user_id) new_discount_users.push(item)
              });

              individual_price_users.forEach(item => {
                  if(item != req.body.user_id) new_individual_price_users.push(item)
              });

              discount_users = new_discount_users
              individual_price_users = new_individual_price_users
            }


            await bd.set_chat(req.body.id, {discount: discount_users});
            await bd.set_chat(req.body.id, {individualPrice: individual_price_users});
            res.status(200).send({ok: true, discount: discount_users, individualPrice: individual_price_users});
        break;
        case 'del_user':
            res.bot1.kickChatMember(req.body.id, req.body.user_id).then(async () => {
                var users = await bd.get_chat(req.body.id);
                users = users.members;
                var i = 0;
                var new_users = [];
                users.forEach(item => {
                    if (item != req.body.user_id) {
                        new_users[i] = item;
                        i++;
                    }
                });
                users = new_users;

                await bd.set_chat(req.body.id, { members: users });
                res.status(200).send({ ok: true, members: users });
            }).catch((err) => {
                res.statusMessage = err.response.body.description;
                res.status(err.response.body.error_code).send(JSON.stringify({ ok: false }));
            })
            break;
        case 'delete_chat':
            fs.unlinkSync(`./database/chat_info/${req.body.id}`);
            fs.unlinkSync(`./database/chat_info_ratings/${req.body.id}`);
            res.bot1.sendMessage(req.body.id, 'Чат был отвязан.').then((r) => {
                setTimeout(() => { res.bot1.deleteMessage(r.chat.id, r.message_id); res.bot1.leaveChat(req.body.id); }, 5000);
            });
            res.status(200).send(JSON.stringify({ ok: true }));
            break;

        case 'change_individual_price':
            await bd.set(`id==${req.body.id}`, `individual_price%=%${req.body.value}`)

        

            res.status(200).send(JSON.stringify({ok: true, individualPrice: req.body.value}));
        break;
    }
}