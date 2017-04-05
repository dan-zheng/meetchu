module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define('Course', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
      // BUG: unique key causes UniqueConstraintIssue
      // unique: 'courseIndex'
    },
    number: {
      type: Sequelize.STRING,
      allowNull: false,
      // unique: 'courseIndex'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    creditHours: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        Course.belongsToMany(models.User, { through: 'CourseUser' });
      }
    },
    timestamps: false
  });
  return Course;
};
