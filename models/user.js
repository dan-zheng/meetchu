'use strict';

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
      allowNull: false
    }
  });
  const User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true
      },
      allowNull: false,
      unique: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    major: {
      type: Sequelize.STRING
    }
  }, {
    getterMethods: {
      fullName() {
        return this.firstName + ' ' + this.lastName
      },
      emailFullName() {
        return this.fullName + ' <' + this.email + '>'
      }
    }
  });
  return User;
};
