const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');

/**
 * Load environment variables from .env file
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.load({ path: '.env' });
}

/**
 * Intialize Sequelize using database url
 * Intialize db object used to store models
 */
const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false
});
const db = {};

const dirs = [__dirname, path.join(__dirname, 'joins')];
for (let i = 0; i < dirs.length; i++) {
  fs.readdirSync(dirs[i])
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'joins');
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(dirs[i], file));
    db[model.name] = model;
  });

  Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
