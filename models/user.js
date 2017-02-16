module.exports = (sequelize, Sequelize) => {
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
        return this.firstName + ' ' + this.lastName;
      },
      emailFullName() {
        return this.fullName + ' <' + this.email + '>';
      }
    }
  });
  return User;
};
