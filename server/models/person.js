const bcrypt = require('bcrypt-nodejs');

const DEFAULT_HIDDEN_FIELDS = [
  'password',
  'reset_password_token',
  'reset_password_expiration'
];

const Person = class Person {
  constructor(data) {
    Object.assign(this, data);
  }
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  withPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return Object.assign(this, { password: hash });
  }
  view(fields) {
    return new Person(
      Object.assign({}, ...Object.keys(this)
        .filter(key => fields.includes(key))
        .map(key => ({ [key]: this[key] }))));
  }
  hide(fields = DEFAULT_HIDDEN_FIELDS) {
    return this.view(
      Object.keys(this).filter(key => !fields.includes(key))
    );
  }
  isHidden(field) {
    return this[`privacy_show_${field}`] === 0;
  }
  publicView() {
    return this.view(
      Object.keys(this).filter(key => !this.isHidden(key))
    );
  }
  algoliaView() {
    return {
      objectID: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email
    };
  }
};

module.exports = {
  object: Person,
  create: [
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
      privacy_show_profile_picture_url BOOLEAN DEFAULT 1,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (email),
      UNIQUE (google_id),
      UNIQUE (facebook_id),
      UNIQUE (reset_password_token)
    )`,
    `CREATE TABLE IF NOT EXISTS person_course (
      person_id INT NOT NULL,
      course_id CHAR(36) NOT NULL,
      PRIMARY KEY (person_id, course_id),
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE,
      FOREIGN KEY (course_id)
        REFERENCES course(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS person_chat (
      person_id INT NOT NULL,
      chat_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (chat_id, person_id),
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
        ON DELETE CASCADE,
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS person_notification (
      person_id INT NOT NULL,
      notification_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (notification_id, person_id),
      FOREIGN KEY (notification_id)
        REFERENCES notification(id)
        ON DELETE CASCADE,
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS person_meeting (
      person_id INT NOT NULL,
      meeting_id INT NOT NULL,
      time JSON,
      PRIMARY KEY (person_id, meeting_id),
      FOREIGN KEY (person_id)
        REFERENCES person(id)
        ON DELETE CASCADE,
      FOREIGN KEY (meeting_id)
        REFERENCES meeting(id)
        ON DELETE CASCADE
    )`
  ]
};
