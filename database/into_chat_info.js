const fs = require('fs');

module.exports = async (id = Number, name = String, link = String) => {
    var default_info = {
        id: id,
        work: false,
        name: name,
        priority: 0,
        chat_link: link,
        stage: 'none',
        time_end: 0,
        time_paid: 0,
        message_id: 0,
        text_notification: `Текст уведомления в новом чате ${id}`,
        text_record_start: `Текст начала записи в новом чате ${id}`,
        text_record_end: `Текст окончания записи в новом чате ${id}`,
        text_pay: 'Оплатите игру',
        text_users_list: 'Вот и список игроков:',
        text_change_list: '♻️ ИЗМЕНЕНИЯ В СОСТАВЕ\nИз-за отсутствия оплаты, я был вынужден выгнать тех кто не заплатил.',
        text_game_info: '⚽️УВИДИМСЯ НА ИГРЕ\nТекст с адресом проведения игры, важной информацией и картой\n%%#GeoTag Lat 55.672829 Lon 37.484667#%%',
        text_game_info1: '👕👚🎽\nФОРМИРОВАНИЕ КОМАНД.\nКоманды автоматически формируются ботом, прочая информация.',
        game_day: 0,
        game_start_hour: 12,
        game_start_minute: 00,
        game_end_hour: 20,
        game_end_minute: 00,
        game_limit_users: 5,
        game_notification_time: 60,
        game_paid_time: 120,
        game_paid1_time: 60,
        game_waiting_time: 240,
        paid_online: false,
        discount: [],
        members: [],
        base: [],
        auto_change_value: 0,
        auto_change_current: 0,
        set_auto: false,
        merchantID: 0,
        secretWord: 'secret_word',
        orderID: 0,
        amount: 777,
        orderID1: 0,
        amount1: 1,
        block: false,
        feedback_url: '',
        paid_online_white: true,
        rating: false,
    }
    fs.writeFileSync(`./database/chat_info/${id}`, JSON.stringify(default_info));
    // Рейтинги по чатам
    fs.writeFileSync(`./database/chat_info_ratings/${id}`, JSON.stringify([]));

    return default_info;
}