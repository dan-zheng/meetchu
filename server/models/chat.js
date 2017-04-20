module.exports = {
  create: [
    `CREATE TABLE IF NOT EXISTS chat (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`
  ]
};
