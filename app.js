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

  // Define a Many-to-Many Relationship for Users-Groups
  // Relationship is defined in UserGroup table
  models.User.belongsToMany(models.Group, {as: 'Group', through: 'UserGroup'});
  models.Group.belongsToMany(models.User, {through: 'UserGroup'});

  // Database test
  models.User.findOrCreate({
    where: {
      email: 'student@purdue.edu',
      firstName: 'Jack',
      lastName: 'Smith',
    }
  }).spread((user, created) => {
    console.log('Found user: ' + user.emailFullName)
    models.Group.findOrCreate({
      where: {
        name: 'CS252 Students',
        groupType: 'group',
        description: 'A study group for CS 252 students'
      }
    }).spread((group, created) => {
      user.setGroup(group);
    });
  });

});

module.exports = app;
