const option = require('scala-like-option');
const Either = require('monet');

module.exports = models => ({
    /**
     * Retrieves a user by email.
     * @param {Object} email - the user's email.
     *  and an associated OAuth id (e.g. facebook_id, google_id)
     * @return {Promise} an optional User promise.
     */
  findById(id) {
    return models.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
      .then(rows => option.Option(rows[0]))
      .then(headOption => headOption.map(user => new models.User(user)));
  },
    /**
     * Retrieves a user by email.
     * @param {Object} email - the user's email.
     *  and an associated OAuth id (e.g. facebook_id, google_id)
     * @return {Promise} an optional User promise.
     */
  findByEmail(email) {
    return models.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
      .then(rows => option.Option(rows[0]))
      .then(headOption => headOption.map(user => new models.User(user)));
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
     * @param {String} email - the user's email.
     * @return {Promise} a boolean promise, true if user was updated.
     */
  loginWithEmail(login) {
    return models.pool.query(
      `UPDATE users
        SET last_login = CURRENT_TIMESTAMP
      WHERE email = ?
      `, [login.email])
      .then(result => this.findByEmail(login.email))
      .then(maybeUser => maybeUser.fold(() => Either.Left('Email not found.'), u => Either.Right(u)))
      .then(result => result.flatMap((user) => {
        if (user.verifyPassword(login.password)) {
          return Either.Right(user);
        }
        return Either.Left('Password does not match.');
      }));
  },
  updatePassword(id, password) {
    return models.pool.query(
      `UPDATE users
        SET password = ?
      WHERE id = ?
      `, [password, id])
      .then(result => result.affectedRows > 0);
  }
});
