
module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS message(
      id INT AUTO_INCREMENT,
      sender_id INT NOT NULL,
      chat_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (sender_id)
        REFERENCES person(id),
      FOREIGN KEY (chat_id)
        REFERENCES chat(id)
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
