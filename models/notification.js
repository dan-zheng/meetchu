module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    text: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'timeSent',
    updatedAt: false
  });
  return Notification;
};
