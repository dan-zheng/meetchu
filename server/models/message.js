module.exports = {
  create: [
    `CREATE TABLE IF NOT EXISTS message (
      id INT AUTO_INCREMENT,
      sender_id INT NOT NULL,
      chat_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      time_sent DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (sender_id)
        REFERENCES person(id)
        ON DELETE CASCADE,
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
        ON DELETE CASCADE
    )`
  ]
};
