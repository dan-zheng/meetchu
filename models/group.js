module.exports = (sequelize, Sequelize) => {
  const Group = sequelize.define('Group', {
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
      type: Sequelize.STRING,
      allowNull: true
    },
    groupType: {
      type: Sequelize.ENUM,
      values: ['group', 'private-message'],
      defaultValue: 'private-message',
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        Group.belongsToMany(models.User, { through: 'UserGroup', timestamps: true, updatedAt: false });
      }
    }
  });
  return Group;
};
