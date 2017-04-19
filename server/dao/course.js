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
  addPerson(course, person) {
    return models.pool.query(
      `INSERT INTO person_course
        (person_id, course_id)
        VALUES (?, ?)`, [person.id, course.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  removePerson(course, person) {
    return models.pool.query(
      `DELETE FROM person_course
        WHERE person_id = ? AND course_id = ?`, [person.id, course.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  findByCourseId(id) {
    return models.pool.query('SELECT * FROM course WHERE id = ?', [id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  findByCourseIds(ids) {
    return Promise.all(ids.map(id => this.findByCourseId(id)));
  }
});
