/**
 * Module dependencies
 */
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env' });

/**
 * Models
 */
const models = require('./models');

/**
 * Controllers
 */
const homeController = require('./controllers/home');

/**
 * Express configuration
 */
const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/*
 * Define app routes
 */
app.get('/', homeController.index);

/**
 * Create any missing database tables and start Express server
 */
models.sequelize.sync().then(() => {
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });

  // Database test
  // findOrCreate to avoid problems with unique constraint
  models.User.findOrCreate({
    where: {
      email: 'student@purdue.edu',
      firstName: 'Jack',
      lastName: 'Smith',
    }
  });

  models.User.findOne({
    where: { email: 'student@purdue.edu' }
  }).then(user => {
    console.log('Found user: ' + user.emailFullName)
  })

});

module.exports = app;
