/**
 * Module dependencies
 */
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');

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
const userController = require('./controllers/user');

/**
 * Express configuration
 */
const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(sass({
  src: path.join(__dirname, 'public/scss'),
  dest: path.join(__dirname, 'public/css'),
  prefix: '/css',
  outputStyle: 'compressed'
}));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/*
 * Define app routes
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);

/**
 * Create any missing database tables and start Express server
 */
models.sequelize.sync().then(() => {
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });

  // Database test
  const user = models.User.create({
    email: 'student@purdue.edu',
    firstName: 'Jack',
    lastName: 'Smith',
  });

  const group = models.Group.create({
    name: 'CS 252 Students',
    groupType: 'group',
    description: 'A study group for CS 252 students'
  });

  // Course test
  const course = models.Course.create({
    name: 'Computer Architecture',
    department: 'CS',
    courseNumber: '250',
    description: 'A class about computer architecture'
  });

  const prof1 = models.Instructor.create({
    email: 'grr@purdue.edu',
    name: 'Gustavo Rodriquez'
  });

  const prof2 = models.Instructor.create({
    email: 'gba@purdue.edu',
    name: 'George Adams'
  });

  Promise.all([user, group]).then((newUser, newGroup) => {
    newUser.addGroup(newGroup);
  });

  Promise.all([course, prof1, prof2]).then((newCourse, newProf1, newProf2) => {
    newCourse.addProfessors([newProf1, newProf2]);
  });
});

module.exports = app;
