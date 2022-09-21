const
    bd = require('../../database'),
    teams = require('../../teamDataBase'),
    checkRules = require('../checkRules'),
    fs = require('fs');

const phrases = require('../../phrases');

module.exports = async (req, res) => {
    var accept = await checkRules(req.cookies);
    if (!accept.editTeam) {
        res.status(403).send('У вас нет доступа');
        return;
    }

    switch (req.params.link) {
        case 'saveTeamInfo':
            var teamInfo = await teams.get(req.params.teamId);
            var newData = {
                prize: req.body.newDate.prize
            }

            if (teamInfo.prize.length == 0) {
                newData.teams = req.body.newDate.teams;
            }

            const chatId = req.body.newDate.chatId;
            const chat_info = await bd.get_chat(chatId);
            await newData.prize.forEach(async (prize, index) => {
                var changePoint = (prize.point || 0) - (teamInfo.prize[index] ? teamInfo.prize[index].point : 0);


                let chatInfoRatings = fs.readFileSync(`./database/chat_info_ratings/${chatId}`);
                chatInfoRatings = JSON.parse(chatInfoRatings);

                await (newData.teams || teamInfo.teams)[index].players.forEach(async player => {
                    // Локальный рейтинг и игры
                    let user = chatInfoRatings.find(a => a.userId == player);
                    if (user) {
                        user.data.rating += changePoint;
                        user.data.games += 1;
                        fs.writeFileSync(`./database/chat_info_ratings/${chatId}`, JSON.stringify(chatInfoRatings));
                    } else {
                        chatInfoRatings.push({
                            userId: player,
                            data: {
                                rating: changePoint,
                                games: 1
                            }
                        })
                        fs.writeFileSync(`./database/chat_info_ratings/${chatId}`, JSON.stringify(chatInfoRatings));
                    }

                    // Общий рейтинг и игры
                    if (chat_info.rating) { // Если установлен чекбокс рейтинга, то обновляем и в общем
                        var userInfo = await bd.get(`id==${player}`)[0];
                        userInfo.rating += changePoint;
                        if (userInfo.games) {
                            userInfo.games += 1; // +1 game
                        } else {
                            userInfo.games = 1;
                            await res.bot1.sendMessage(player, `Спасибо за игру!🤝\nПоделись, пожалуйста, своим впечатлением от первой игры)\nНам важно Твое мнение!✋😄`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: "🙂 Поделиться впечатлениями", url: `https://docs.google.com/forms/d/e/1FAIpQLScP8VMJjJlsru82NAlh5OVastn9-nATklLSP4VQ10BMKbmznA/viewform?usp=sf_link` }]] } });
                        }
                        await bd.set(`id==${player}`, `rating%=%${userInfo.rating}`);
                        await bd.set(`id==${player}`, `games%=%${userInfo.games}`);
                    }
                })

            })
            if (chat_info.feedback_url && newData.prize.length > 0) {
                const url = chat_info.feedback_url;
                await res.bot1.sendMessage(chatId, phrases.string68, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: "⛹️ К.-И. чемпионат дня", url: `https://xn--80afo7al4d.xn----btbtarbil8ajk.xn--80adxhks/наш-чемпионат/?chat=${chatId}` }, { text: "🥇 Оценить игроков", url: url }]] } });
            }

            if (await teams.get(req.params.teamId, newData).ok) {
                res.status(200).send({ ok: true });
            } else {
                res.status(404).send({ ok: false });
            }
            break;

        default:
            res.status(404).send('Ссылка не работает')
    }
}