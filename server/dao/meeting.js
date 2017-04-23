const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  create(meeting) {
    return models.pool.query(
      'INSERT INTO meeting (name, location, description) VALUES (?, ?, ?)',
        [meeting.name, meeting.location, meeting.description])
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
      'REPLACE INTO meeting_time (meeting_id, time) VALUES (?, ?)', [meeting.id, times])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  setPersonTimes(meeting, person, times) {
    return models.pool.query(
      'REPLACE INTO person_meeting_time (person_id, meeting_id, time) VALUES (?, ?, ?)',
        [person.id, meeting.id, times])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  }
});
