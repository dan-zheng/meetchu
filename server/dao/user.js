const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

const verifyLoginAsync = (user, password) =>
  user.verifyPassword(password)
  .then((passwordMatches) => {
    if (passwordMatches) {
      return Either.Right(user);
    }
    Either.Left('Password does not match.');
  });

const verifyLoginSync = (user, password) => {
  if (user.verifyPassword(password)) {
    return Either.Right(user);
  }
  return Either.Left('Password does not match.');
};

module.exports = models => ({
  /**
   * Retrieves a user by email.
   * @param {Object} email - the user's email.
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Maybe[User]
   */
  findById(id) {
    return models.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
      .then(rows => rows.list().headMaybe().map(user => new models.User(user)));
  },
  /**
   * Retrieves a user by email.
   * @param {Object} email - the user's email.
   * @return {Maybe} Maybe[User]
   */
  findByEmail(email) {
    return models.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
      .then(rows => rows.list().headMaybe().map(user => new models.User(user)));
  },
  /**
   * Inserts a new user if not already in database.
   * @param {Object} identity - an object containing
   *  the user's email, first_name, last_name
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Either[String, User]
   */
  signup(identity) {
    const user = new models.User(identity);
    const hash = user.genPasswordHash(identity.password);
    const userWithHash = Object.assign(user, { password: hash });
    return models.pool.query(
      `INSERT IGNORE INTO users
        (email, first_name, last_name, password)
        VALUES(?, ?, ?, ?)`,
      [identity.email, identity.first_name, identity.last_name, hash])
      .then((result) => {
        if (result.affectedRows === 0) {
          return Either.Left('An account with that email already exists.');
        }
        const userWithId = Object.assign(userWithHash, { id: result.insertId });
        return Either.Right(userWithId);
      });
  },
  /**
   * Inserts or updates the user's first_name, last_name, last_login
   *  and associated OAuth id fields.
   * @param {Object} identity - an object containing
   *  the user's email, first_name, last_name
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} Maybe[Left]
   */
  externalLogin(identity) {
    return models.pool.query(`INSERT INTO users
      (email, first_name, last_name, google_id, facebook_id)
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
   * Updates the user's last_login field.
   * @param {Object} login { email: the user's email, password: the user's hashed password }
   * @return {Promise}
   */
  loginWithEmail(login) {
    return this.findByEmail(login.email)
      .then(maybeUser => maybeUser.toEither('Email not found.'))
      .then(result => result.flatMap(user => verifyLoginSync(user, login.password)))
      .then(result => result.flatMap(user => this.updateLastLogin(user)
        .then(() => Either.Right(user))))
      .errorToLeft();
  },
  update(user, fields) {
    const keys = fields || Object.keys(user);
    const values = keys.map(key => user[key]);
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const query = ['UPDATE users', `SET ${updates}`, 'WHERE id = ?'].join('\n\t');
    return models.pool.query(query, [...values, user.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  erase(user) {
    return models.pool.query(`DELETE FROM users WHERE id = ?`, [user.id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  updateLastLogin(user) {
    return models.pool.query(`UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?`, [user.id])
    .then(result => Either.Right(result.affectedRows))
    .errorToLeft();
  }
});
