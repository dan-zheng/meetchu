module.exports = {
  create: [
    `CREATE TABLE IF NOT EXISTS meeting (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      description VARCHAR(255),
      creator_id INT NOT NULL,
      final_time DATETIME,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (creator_id)
        REFERENCES person(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS meeting_time (
      meeting_id INT NOT NULL,
      time JSON NOT NULL,
      PRIMARY KEY (meeting_id),
      FOREIGN KEY (meeting_id)
        REFERENCES meeting(id)
        ON DELETE CASCADE
    )`
  ]
};
