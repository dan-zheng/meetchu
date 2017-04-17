const monet = require('monet');
require('../../lib/monet-pimp.js')(monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  /**
   * Retrieves a user by email.
   * @param {Object} email - the user's email.
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} an optional User promise.
   */
  findById(id) {
    return models.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
      .then(rows => rows.list().headMaybe().map(user => new models.User(user)));
  },
  /**
   * Retrieves a user by email.
   * @param {Object} email - the user's email.
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} an optional User promise.
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
   * @return {Promise}
   */
  signup(identity) {
    const user = new models.User(identity);
    const hash = user.genPasswordHash(identity.password);
    user.password = hash;
    return models.pool.query(
      `INSERT IGNORE INTO users
        (email, first_name, last_name, password)
        VALUES(?, ?, ?, ?)`,
      [identity.email, identity.first_name, identity.last_name, hash])
      .then((result) => {
        if (result.affectedRows === 0) {
          return Either.Left('An account with that email already exists.');
        }
        user.id = result.insertId;
        return Either.Right(user);
      });
  },
  /**
   * Inserts or updates the user's first_name, last_name, last_login
   *  and associated OAuth id fields.
   * @param {Object} identity - an object containing
   *  the user's email, first_name, last_name
   *  and an associated OAuth id (e.g. facebook_id, google_id)
   * @return {Promise} a User promise.
   */
  externalLogin(identity) {
    return models.pool.query(
      `INSERT INTO users
        (email, first_name, last_name, google_id, facebook_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          last_login = CURRENT_TIMESTAMP,
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          facebook_id = IFNULL(facebook_id, VALUES(facebook_id)),
          google_id = IFNULL(google_id, VALUES(google_id));
      `,
      [identity.email, identity.first_name, identity.last_name,
        identity.facebook_id, identity.google_id])
      .then(result => this.findById(result.insertId));
  },
  /**
   * Updates the user's last_login field.
   * @param {Object} login { email: the user's email, password: the user's hashed password }
   * @return {Promise} a boolean promise, true if user was updated.
   */
  loginWithEmail(login) {
    return this.findByEmail(login.email)
      .then(maybeUser => maybeUser.toEither('Email not found.'))
      .then(result => result.flatMap((user) => {
        if (user.verifyPassword(login.password)) {
          return Either.Right(user);
        }
        return Either.Left('Password does not match.');
      }))
      .then(result => result.flatMap(user =>
        this.updateLastLogin(user.id)
          .then((wasUpdated) => {
            if (wasUpdated) {
              return Either.Right(user);
            }
            return Either.Left('Database error (failed to update last login)');
          })
      ));
  },
  update(user, fields) {
    if (user.id) {
      const keys = fields || Object.keys(user);
      const values = keys.map(key => user[key]);
      const updates = keys.map(key => `${key} = ?`).join(', ');
      const query = `UPDATE users \nSET ${updates}\nWHERE id = ?`;
      return models.pool.query(query, [...values, 'id'])
        .then(result => Either.Right(result.affectedRows > 0));
    } else {
      return Promise.resolve(Either.Left('Cannot execute query without a user id.'));
    }
  },
  updateLastLogin(id) {
    return models.pool.query(
      `UPDATE users
        SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
      `, [id])
      .then(result => result.affectedRows > 0);
  }
});
