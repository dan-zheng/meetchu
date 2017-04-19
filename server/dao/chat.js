const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  findByPerson(user) {
    return models.pool.query(
      `SELECT * FROM course
        JOIN person_course
        ON person_id = id
        WHERE person_id = ?`, [user.id])
      .then(result => Either.Right(result.list()))
      .errorToLeft();
  },
  addPerson(chat, person) {
    return models.pool.query(
      `INSERT INTO person_chat
        (person_id, chat_id)
        VALUES (?, ?)`, [person.id, chat.id])
      .then(result => Either.Right(result.affectedRows))
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
