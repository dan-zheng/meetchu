const bcrypt = require('bcrypt-nodejs');

function User(data) {
  Object.assign(this, data);
}

User.prototype.genPasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

User.prototype.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

User.prototype.updatePassword = function (password) {
  this.password = this.genPasswordHash(this.password);
};

module.exports = {
  object: User,
  query: [
    `CREATE TABLE IF NOT EXISTS person (
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
    )`,
    `CREATE TABLE IF NOT EXISTS person_course (
      person_id INT NOT NULL,
      course_id INT NOT NULL,
      PRIMARY KEY (person_id, course_id),
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE,
      FOREIGN KEY (course_id)
        REFERENCES course(id)
        ON DELETE CASCADE
    )`
    /*,
    `CREATE TABLE IF NOT EXISTS person_chat (
      chat_id INT NOT NULL,
      person_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (chat_id, user_id),
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
        ON DELETE CASCADE,
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS person_notification (
      notification_id INT NOT NULL,
      person_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notification_id)
        REFERENCES notification(id)
        ON DELETE CASCADE,
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`*/
  ]
};
