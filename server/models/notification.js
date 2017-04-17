
module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS notification (
      id INT AUTO_INCREMENT,
      message VARCHAR(255) NOT NULL,
      seen BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`
  ]
};

/*module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false
    },
    seen: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    createdAt: true,
    updatedAt: false
  }, {
    classMethods: {
      associate: (models) => {
        Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
      }
    }
  });
  return Notification;
};*/
