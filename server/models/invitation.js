module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS invitation (
      id INT NOT NULL AUTO_INCREMENT,
      chat_id INT NOT NULL,
      sender_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (sender_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`
  ]
};
