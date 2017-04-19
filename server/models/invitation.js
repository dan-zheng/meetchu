module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS invitation (
      id INT NOT NULL AUTO_INCREMENT,
      chat_id INT NOT NULL,
      sender_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
        ON DELETE CASCADE,
      FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )`
  ]
};
