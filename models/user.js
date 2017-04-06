const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    googleId: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    },
    facebookId: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
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
      type: Sequelize.STRING,
      allowNull: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
      allowNull: true
    },
    profilePictureURL: {
      type: Sequelize.STRING,
      allowNull: true
    },
    privacyShowEmail: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    privacyShowMajor: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    privacyShowProfilePicture: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: (models) => {
        User.belongsToMany(models.Group, { through: 'UserGroup' });
        User.belongsToMany(models.Meeting, { through: 'UserMeeting' });
        User.belongsToMany(models.Course, { through: 'CourseUser' });
        User.hasMany(models.Notification, { as: 'notifications', foreignKey: 'userId' });
        User.belongsToMany(models.DateTime, { through: 'UserDateTime', timestamps: false });
      }
    },
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      emailFullName() {
        return this.fullName + ' <' + this.email + '>';
      }
    },
    setterMethods: {
      password(password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        this.setDataValue('password', hash);
      }
    },
    instanceMethods: {
      verifyPassword(password, done) {
        bcrypt.compare(password, this.password, (err, isMatch) => {
          done(err, isMatch);
        });
      }
    }
  });
  return User;
};
