const fs = require('fs');

module.exports = (file_name, data) => {
    if (!file_name || data.toString() != '[object Object]') return;

    var default_data =
    {
        id: 0,
        domain: '',
        question: 0,
        rating: 0,
        games: 0,
        mark: 7,
        first_name: '',
        last_name: '',
        patronymic: '',
        birthdate: '',
        vk_link: '',
        phone: '',
        photo: '',
        registrar_type: 0,
        registration_date: 0
    };

    for (var key in data) {
        default_data[key] = data[key];
    }

    fs.writeFileSync(`./database/users_info/${file_name}`, JSON.stringify(default_data));
    return [default_data];
}