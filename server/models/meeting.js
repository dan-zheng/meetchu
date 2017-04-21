module.exports = {
  create: [
    `CREATE TABLE IF NOT EXISTS meeting (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      description VARCHAR(255),
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      final_time_id INT,
      PRIMARY KEY (id),
      FOREIGN KEY (final_time_id)
        REFERENCES meeting_time(id)
    )`,
    `CREATE TABLE IF NOT EXISTS meeting_time (
      id INT NOT NULL AUTO_INCREMENT,
      time DATETIME NOT NULL,
      meeting_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (meeting_id)
        REFERENCES meeting(id)
        ON DELETE CASCADE
    )`
  ]
};
