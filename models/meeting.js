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
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: (models) => {
        Meeting.belongsToMany(models.User, { through: 'UserMeeting', timestamps: true, updatedAt: false });
        Meeting.hasMany(models.DateTime);
      }
    }
  });
  return Meeting;
};
