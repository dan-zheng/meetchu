const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env' });

/**
 * Intialize Sequelize using database url
 * Intialize db object used to store models
 */
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => { return (file.indexOf('.') !== 0) && (file !== 'index.js'); })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

// Define a Many-to-Many Relationship for Users-Groups
// Relationship is defined in UserGroup table
db.User.belongsToMany(db.Group, { through: 'UserGroup' });
db.Group.belongsToMany(db.User, { through: 'UserGroup' });

// Define a Many-to-Many Relationship for Course-Instructor
// This will allow us to efficiently search for courses based on instructor
// Since courses may have more than one instructor
// In the future, we may want to consider defining a relationship between Instructor and User
// for when a Instructor creates an account with Meetchu
db.Course.belongsToMany(db.Instructor, { through: 'CourseInstructor' });
db.Instructor.belongsToMany(db.Course, { through: 'CourseInstructor' });

// Define a Many-to-Many Relationship for CourseUser
db.Course.belongsToMany(db.User, { through: 'CourseUser' });
db.User.belongsToMany(db.Course, { through: 'CourseUser' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
