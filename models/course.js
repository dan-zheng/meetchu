module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define('Course', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
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
      type: Sequelize.STRING,
      allowNull: true
    },
    creditHours: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: false
  });
  return Course;
};
