module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define('Course', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    department: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'courseIndex'
    },
    courseNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'courseIndex'
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
  return Course;
};
