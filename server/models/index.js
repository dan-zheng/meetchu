const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('promise-mysql');
const debugging = false;

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env', silent: process.env.NODE_ENV === 'production' });

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const dirs = [__dirname];
const valid = ['user.js', 'course.js'];
// Flatten and filter directory files
const files = [].concat.spread([], dirs.map(dir =>
  fs.readdirSync(dir)
    // TODO remove once all models have been converted to new format
    .filter(file => valid.includes(file))
    // Get fully qualified path
    .map(file => path.join(dir, file))
    // Ignore directories
    .filter(file => fs.statSync(file).isFile()
  )));

const fileExports = files.map(file => require(file));

function withModels(models) {
  fileExports.forEach((model) => {
    if (model.object) {
      models[model.object.name] = model.object;
    }
  });
  return models;
}

function executeQuery(query) {
  if (debugging) console.log(`Executing Query: \n${query}`);
  pool.query(query).catch((error) => {
    console.log(`Error creating table.`);
    throw error;
  });
}

function sync() {
  console.log('Creating database tables.');
  fileExports.forEach((model) => {
    if (model.query) {
      model.query.forEach((query) => {
        executeQuery(query);
      });
    }
  });
}

module.exports = withModels({ pool, sync });
