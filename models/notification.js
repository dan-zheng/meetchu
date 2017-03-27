module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
    //CHANGED FROM STRING. WHY? HAHAHAH
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    
    text: {
      type: Sequelize.STRING,
      allowNull: false
    },
    seen: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: true,
    updatedAt: false
  }, {
    classMethods: {
      associate: (models) => {
        Notification.belongsTo(models.User, { through: 'UserNotification' });
      }
    }
  });
  return Notification;
};
