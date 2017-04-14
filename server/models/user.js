const bcrypt = require('bcrypt-nodejs');

function User(data) {
  Object.assign(this, data);
}

User.prototype.genPasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

User.prototype.verifyPassword = function (password, done) {
  bcrypt.compare(password, this.password, (error, isMatch) => {
    done(error, isMatch);
  });
};

module.exports = {
  object: User,
  query: [
    `CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      google_id INT,
      facebook_id INT,
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      major VARCHAR(255),
      password VARCHAR(255),
      reset_password_token VARCHAR(255),
      reset_password_expiration VARCHAR(255),
      profile_picture_url VARCHAR(255),
      privacy_show_email BOOLEAN DEFAULT 1,
      privacy_show_major BOOLEAN DEFAULT 1,
      privacy_show_profile_picture BOOLEAN DEFAULT 1,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (email),
      UNIQUE (google_id),
      UNIQUE (facebook_id),
      UNIQUE (reset_password_token)
    )`
  ]
};