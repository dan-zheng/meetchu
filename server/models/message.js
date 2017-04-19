
module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS message(
      id INT AUTO_INCREMENT,
      sender_id INT NOT NULL,
      group_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (sender_id)
        REFERENCES user(id)
      FOREIGN KEY (group_id)
        REFERENCES group(id)
    )`
  ]
};


/*module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    groupId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'timeSent',
    updatedAt: false
  });
  return Message;
};*/
