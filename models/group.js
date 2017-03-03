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
      type: Sequelize.STRING
    },
    groupType: {
      type: Sequelize.ENUM,
      values: ['group', 'private-message'],
      defaultValue: 'private-message',
      allowNull: false
    }
  });
  return Group;
};
