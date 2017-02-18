const bcrypt = require('bcrypt-nodejs');

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
    },
    passwordHash: {
      type: Sequelize.STRING,
      allowNull: true
    },
    passwordSalt: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    getterMethods: {
      fullName() {
        return this.firstName + ' ' + this.lastName;
      },
      emailFullName() {
        return this.fullName + ' <' + this.email + '>';
      }
    },
    instanceMethods: {
      setPassword(password, next) {
        return bcrypt.genSalt(10, (err1, salt) => {
          if (err1) { return next(err1); }
          return bcrypt.hash(this.password, salt, null, (err2, hash) => {
            if (err2) { return next(err2); }
            this.password = hash;
            return next();
          });
        });
      },
      verifyPassword(password, done) {
        return bcrypt.compare(password, this.password, (err, isMatch) => done(err, isMatch));
      }
    }
  });
  return User;
};
