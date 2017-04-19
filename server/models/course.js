module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS course (
      uuid CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      number VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      credit_hours TINYINT(2) NOT NULL,
      PRIMARY KEY (uuid)
    )`
  ]
};
