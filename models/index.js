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
const sequelize = new Sequelize(process.env.DATABASE_URL);
const db = {};

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
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
db.User.belongsToMany(db.Group, { as: 'Group', through: 'UserGroup' });
db.Group.belongsToMany(db.User, { through: 'UserGroup' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
