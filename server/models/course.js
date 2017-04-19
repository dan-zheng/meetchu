module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS course (
      id CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      number VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      credit_hours TINYINT(2) NOT NULL,
      PRIMARY KEY (id)
    )`
  ]
};
