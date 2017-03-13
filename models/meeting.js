module.exports = (sequelize, Sequelize) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING
    }
  });
  return Meeting;
};
