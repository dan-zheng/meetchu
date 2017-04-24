const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  findByPerson(person) {
    return models.pool.query(`
      SELECT meeting.* FROM meeting
      JOIN person_meeting
      ON meeting_id = id AND person_id = ?`, [person.id])
      .then(result => Either.Right(result.list()))
      .errorToLeft();
  },
  findById(id) {
    return models.pool.query('SELECT * FROM meeting WHERE id = ? LIMIT 1', [id])
      .then(rows => rows.list().headMaybe())
      .then(maybeMeeting => maybeMeeting.toEither('Meeting not found.'))
      .errorToLeft();
  },
  getPeopleByMeeting(meeting) {
    return models.pool.query(
      `SELECT person.*, time FROM person
        JOIN person_meeting
        ON person_id = person.id
        WHERE meeting_id = ?`, [meeting.id])
      .then(rows => Either.Right(rows.list().map(person => new models.Person(person))))
      .errorToLeft();
  },
  create(person, meeting) {
    return models.pool.query(
      'INSERT INTO meeting (name, location, description, creator_id, time) VALUES (?, ?, ?, ?, ?)',
        [meeting.name, meeting.location, meeting.description, person.id, meeting.time])
      .then(result => Either.Right(
        Object.assign(meeting, { id: result.insertId })))
      .errorToLeft();
  },
  erase(meeting) {
    return models.pool.query('DELETE FROM meeting WHERE id = ?', [meeting.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  update(meeting, fields) {
    const keys = fields || Object.keys(meeting);
    const values = keys.map(key => meeting[key]);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const query = ['UPDATE meeting', `SET ${updates}`, 'WHERE id = ?'].join('\n\t');
    return models.pool.query(query, [...values, meeting.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  leave(meeting, person) {
    const isCreator = meeting.creator_id === person.id;
    const leaveMeeting = models.pool.query(
      `DELETE FROM person_meeting WHERE person_id = ? AND meeting_id`,
        [person.id, meeting.id])
        .then(result => result.affectedRows === 0 ?
          Either.Left('User was not a part of the meeting.') :
          Either.Right(result.affectedRows));
    if (isCreator) {
      return leaveMeeting.then(result =>
        result.flatMap(() => this.erase(meeting)))
      .errorToLeft();
    }
    return leaveMeeting.errorToLeft();
  },
  addPerson(meeting, person) {
    return models.pool.query(
      `INSERT IGNORE INTO person_meeting
        (person_id, meeting_id)
        VALUES (?, ?)`, [person.id, meeting.id])
      .then(result => result.affectedRows === 0 ?
        Either.Left('User was already added to the meeting.') :
        Either.Right(result.insertId))
      .errorToLeft();
  },
  addPeople(meeting, people) {
    const values = people.map(person => [person.id, meeting.id]);
    return models.pool.query(
      'INSERT IGNORE INTO person_meeting (person_id, meeting_id) VALUES ?', [values])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  setMeetingTimes(meeting, times) {
    return models.pool.query(
      'UPDATE meeting SET time = ? WHERE id = ?', [times, meeting.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  setPersonTimes(meeting, person, times) {
    return models.pool.query(
      'REPLACE INTO person_meeting (person_id, meeting_id, time) VALUES (?, ?, ?)',
        [person.id, meeting.id, times])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  getPersonTimes(meeting, person) {
    return models.pool.query(
      'SELECT time FROM person_meeting WHERE person_id = ?', [person.id])
      .then(times => Either.Right(times))
      .errorToLeft();
  }
});
