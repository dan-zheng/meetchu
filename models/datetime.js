module.exports = (sequelize, Sequelize) => {
  const DateTime = sequelize.define('DateTime', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    dateTime: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        // DateTime.belongsTo(models.Meeting, { as: 'meeting' });
        DateTime.belongsTo(models.Meeting);
      }
    },
    timestamps: false
  });
  return DateTime;
};
