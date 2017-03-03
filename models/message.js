module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define('Message', {
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
  return Message;
};
