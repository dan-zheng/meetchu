const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  /**
   * @return Promise[Either[String, List[Course]]]
   */
  findByPerson(person) {
    return models.pool.query(
      `SELECT course.* FROM course
        JOIN person_course
        ON course_id = id
        WHERE person_id = ?
        ORDER BY \`subject\` DESC, number DESC`, [person.id])
      .then(result => Either.Right(result.list()))
      .errorToLeft();
  },
  /**
   * @return Promise[Either[String, Integer]]
   */
  addPerson(course, person) {
    return this.addPersonBulk([course], person);
  },
  /**
   * @return Promise[Either[String, Integer]]
   */
  addPersonBulk(courses, person) {
    const values = courses.map(course => [person.id, course.id]);
    return models.pool.query(
      'INSERT IGNORE INTO person_course (person_id, course_id) VALUES ?', [values])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  /**
   * @return Promise[Either[String, Integer]]
   */
  removePerson(course, person) {
    return models.pool.query(
      `DELETE FROM person_course
        WHERE person_id = ? AND course_id = ?`, [person.id, course.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  /**
   * @return Promise[Either[String, List[Person]]]
   */
  findPeopleByCourse(course) {
    return models.pool.query(
      `SELECT person.* FROM person
        JOIN person_course
        ON person_id = person.id
        WHERE course_id = ?`, [course.id])
      .then(rows => Either.Right(rows.list().map(person => new models.Person(person))))
      .errorToLeft();
  }
});
