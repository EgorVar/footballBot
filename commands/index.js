const registrar = require('./registrar');
const registrar_callback = require('./registrar_callback');
const registrar_photo = require('./registrar_photo');
const registrar_document = require('./registrar_document');

const main = require('./main');
const main_start = require('./main_start');
const main_callback = require('./main_callback');
const main_set_chat = require('./main_set_chat');
const main_new_person = require('./main_new_person');
const main_left_person = require('./main_left_person');

const record = require('./record');
const check_user = require('./check_user');

module.exports = {
    registrar,
    registrar_callback,
    registrar_photo,
    registrar_document,
    main,
    main_start,
    main_callback,
    main_set_chat,
    main_new_person,
    main_left_person,
    record,
    check_user
}