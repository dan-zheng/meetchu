const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('promise-mysql');
const debugging = false;

const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);

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

if (debugging) {
  pool.on('connection', (connection) => {
    connection.on('enqueue', (sequence) => {
      if (sequence && sequence.sql) {
        console.log(`MySQL Query Enqueued: \n> ${sequence.sql}`);
      }
    });
  });
}

const dirs = [__dirname];
const valid = ['person.js', 'course.js', 'invitation.js', 'message.js', 'chat.js', 'notification.js', 'datetime.js', 'meeting.js'];
// TODO: invitation.js requires new foreign key for when chats are made

// Flatten and filter directory files
const files = [].concat.apply([], dirs.map(dir =>
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
  const src = fileExports
    .filter(model => model.object)
    .map(model => ({ [model.object.name]: model.object }));
  return Object.assign(models, ...src);
}

function executeQuery(query) {
  return pool.query(query).catch((error) => {
    console.log('Error creating table.');
    throw error;
  });
}

async function sync() {
  console.log('Creating database tables.');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await Promise.all(fileExports.filter(model => model.create)
    .map(model => model.create.map(query => executeQuery(query)))
    .reduce((prev, curr) => prev.concat(curr), []));
  return pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

module.exports = withModels({ pool, sync });
