module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS invitation (
      id INT NOT NULL AUTO_INCREMENT,
      PRIMARY KEY (id),
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
        ON DELETE CASCADE,
      FOREIGN KEY (sender_id)
        REFERENCES user(id)
        ON DELETE CASCADE
    )`
  ]
};
