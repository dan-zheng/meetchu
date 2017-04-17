module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS invitations (
      uuid CHAR(36) NOT NULL,
      PRIMARY KEY (uuid),
      FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,
      FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )`
  ]
};
