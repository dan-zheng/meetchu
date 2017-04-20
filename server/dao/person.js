const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

const verifyLoginAsync = (person, password) =>
  person.verifyPassword(password)
  .then((passwordMatches) => {
    if (passwordMatches) {
      return Either.Right(person);
    }
    Either.Left('Password does not match.');
  });

const verifyLoginSync = (person, password) => {
  if (person.verifyPassword(password)) {
    return Either.Right(person);
  }
  return Either.Left('Password does not match.');
};

module.exports = models => ({
  /**
   * Retrieves a person by email.
   * @param {Object} email - the person's email.
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Either[String, Person]
   */
  findById(id) {
    return models.pool.query('SELECT * FROM person WHERE id = ? LIMIT 1', [id])
      .then(rows => rows.list().headMaybe().map(person => new models.Person(person)))
      .then(maybePerson => maybePerson.toEither('Person not found.'))
      .errorToLeft();
  },
  /**
   * Retrieves a person by email.
   * @param {Object} email - the person's email.
   * @return {Promise} Either[String, Person]
   */
  findByEmail(email) {
    return models.pool.query('SELECT * FROM person WHERE email = ? LIMIT 1', [email])
      .then(rows => rows.list().headMaybe().map(person => new models.Person(person)))
      .then(maybePerson => maybePerson.toEither('Email not found.'))
      .errorToLeft();
  },
  /**
   * Inserts a new person if not already in database.
   * @param {Object} identity - an object containing
   *  the person's email, first_name, last_name
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Either[String, person]
   */
  signup(person) {
    return models.pool.query(
      `INSERT IGNORE INTO person
        (email, first_name, last_name, password)
        VALUES(?, ?, ?, ?)`,
      [person.email, person.first_name, person.last_name, person.password])
      .then(result => result.affectedRows === 0 ?
        Either.Left('An account with that email already exists.') :
        Either.Right(Object.assign(person, { id: result.insertId })))
      .errorToLeft();
  },
  /**
   * Inserts or updates the person's first_name, last_name, last_login
   *  and associated OAuth id fields.
   * @param {Object} identity - an object containing
   *  the person's email, first_name, last_name
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Either[String, person]
   */
  externalLogin(identity) {
    return models.pool.query(`INSERT INTO person
      (email, first_name, last_ name, google_id, facebook_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        last_login = CURRENT_TIMESTAMP,
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        facebook_id = IFNULL(facebook_id, VALUES(facebook_id)),
        google_id = IFNULL(google_id, VALUES(google_id))`,
      [identity.email, identity.first_name, identity.last_name,
        identity.facebook_id, identity.google_id])
      .then(result => this.findById(result.insertId))
      .errorToLeft();
  },
  /**
   * Updates the person's last_login field.
   * @param {Object} login { email: the person's email, password: the person's hashed password }
   * @return {Promise}
   */
  loginWithEmail(login) {
    return this.findByEmail(login.email)
      .then(result => result.flatMap(person => verifyLoginSync(person, login.password)))
      .then(result => result.flatMap(person => this.updateLastLogin(person)
        .then(() => Either.Right(person))))
      .errorToLeft();
  },
  update(person, fields) {
    const keys = fields || Object.keys(person);
    const values = keys.map(key => person[key]);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const query = ['UPDATE person', `SET ${updates}`, 'WHERE id = ?'].join('\n\t');
    return models.pool.query(query, [...values, person.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  erase(person) {
    return models.pool.query(`DELETE FROM person WHERE id = ?`, [person.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  updateLastLogin(person) {
    return models.pool.query(`UPDATE person
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?`, [person.id])
    .then(result => Either.Right(result.affectedRows))
    .errorToLeft();
  }
});
