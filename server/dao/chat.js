const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  create(chat) {
    return models.pool.query(
      'INSERT IGNORE INTO chat (name, description) VALUES (?, ?)',
        [chat.name, chat.description])
      .then(result => result.affectedRows === 0 ?
        Either.Left('The chat already exists.') :
        Either.Right(Object.assign(chat, { id: result.insertId })))
      .errorToLeft();
  },
  erase(chat) {
    return models.pool.query('DELETE FROM chat WHERE id = ?', [chat.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  getChatList(person) {
    return models.pool.query(`
      SELECT chat.id, chat.name, chat.description, person.first_name, person.last_name, message.message, message.time_sent
      FROM person_chat
      JOIN chat
      ON chat_id = chat.id AND person_id = ?
      LEFT JOIN message
        INNER JOIN (
          SELECT id, chat_id, MAX(time_sent) most_recent
          FROM message
          GROUP BY chat_id
        ) sub_message ON message.chat_id = sub_message.chat_id AND message.time_sent = sub_message.most_recent
      ON chat.id = message.chat_id
      LEFT JOIN person
      ON message.sender_id = person.id
      GROUP BY chat.id
      ORDER BY message.time_sent DESC, chat.name DESC`, [person.id])
    .then(result => Either.Right(result.list()))
    .errorToLeft();
  },
  getChatMessages(chat, max) {
    return models.pool.query(`
      SELECT * FROM (
        SELECT chat.name, person.first_name, person.last_name, message.message, message.time_sent
          FROM chat
          JOIN message
          ON chat.id = message.chat_id
          JOIN person
          ON message.sender_id = person.id
          WHERE chat.id = ?
          ORDER BY message.time_sent DESC
          LIMIT ?) messages
      ORDER BY messages.time_sent ASC`, [chat.id, max])
    .then(result => Either.Right(result.list()))
    .errorToLeft();
  },
  findByPerson(person) {
    return models.pool.query(
      `SELECT * FROM course
        JOIN person_course
        ON person_id = id
        WHERE person_id = ?`, [person.id])
      .then(result => Either.Right(result.list()))
      .errorToLeft();
  },
  addMessage(message) {
    return models.pool.query(
      'INSERT INTO message (sender_id, chat_id, message) VALUES (?, ?, ?)',
      [message.sender_id, message.chat_id, message.message])
      .then(result => Either.Right(Object.assign(message, { id: result.insertId })))
      .errorToLeft();
  },
  removeMessage(message) {
    return models.pool.query(
      'DELETE FROM message WHERE id = ?', [message.id])
    .then(result => Either.Right(result.affectedRows))
    .errorToLeft();
  },
  addPerson(chat, person) {
    return models.pool.query(
      `INSERT IGNORE INTO person_chat
        (person_id, chat_id)
        VALUES (?, ?)`, [person.id, chat.id])
      .then(result => result.affectedRows === 0 ?
        Either.Left('User was already added to chat.') :
        Either.Right(result.insertId))
      .errorToLeft();
  },
  removePerson(chat, person) {
    return models.pool.query(
      `DELETE FROM person_chat
        WHERE person_id = ? AND chat_id = ?`, [person.id, chat.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  }
});
