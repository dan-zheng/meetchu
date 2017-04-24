const Chat = class Chat {
  constructor(data) {
    Object.assign(this, data);
  }
  algoliaView() {
    return {
      objectID: this.id,
      name: this.name
    };
  }
};

module.exports = {
  object: Chat,
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
