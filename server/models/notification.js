module.exports = {
  create: [
    `CREATE TABLE IF NOT EXISTS notification (
      id INT AUTO_INCREMENT,
      message VARCHAR(255) NOT NULL,
      seen BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`
  ]
};
