/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('express-session-sequelize')(session.Store);
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');

/**
 * Load environment variables from .env file.
 */
dotenv.load({ path: '.env' });

/**
 * Models.
 */
const models = require('./models');

/**
 * Controllers.
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');
const sequelizeStore = new SequelizeStore({
  db: models.sequelize
});

// models.User.belongsTo(sequelizeStore.Session, { foreignKeyConstraint: true });

/**
 * Express configuration.
 */
const app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public/scss'),
  dest: path.join(__dirname, 'public/css'),
  prefix: '/css',
  outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'nested'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sequelizeStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  saveUninitialized: true,
  resave: true,
  proxy: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/*
 * App routes.
 */
app.get('/', homeController.index);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/addCourses', userController.getAddCourse);
app.post('/addCourses', userController.postAddCourse);

/**
 * Create any missing database tables and start Express server.
 */
models.sequelize.sync().then(() => {
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });

  // Database test
  const user = models.User.findOrCreate({
    where: {
      email: 'student@purdue.edu',
      firstName: 'Jack',
      lastName: 'Smith',
      password: 'password123'
    }
  }).spread((user) => {
    console.log(user);
  });

  const group = models.Group.findOrCreate({
    where: {
      name: 'CS 252 Students',
      groupType: 'group',
      description: 'A study group for CS 252 students'
    }
  }).catch((err) => {
    console.log(err);
  });

  // Course test
  const course = models.Course.findOrCreate({
    where: {
      name: 'Programming in C',
      department: 'CS',
      courseNumber: '240',
      description: 'The UNIX environment, C development cycle, data representation, operators, program structure, recursion, macros, C preprocessor, pointers and addresses, dynamic memory allocation, structures, unions, typedef, bit-fields, pointer/structure applications, UNIX file abstraction, file access, low-level I/O, concurrency.'
    }
  }).catch((err) => {
    console.log(err);
  });

  const prof1 = models.Instructor.findOrCreate({
    where: {
      email: 'grr@purdue.edu',
      name: 'Gustavo Rodriquez'
    }
  }).catch((err) => {
    console.log(err);
  });

  const prof2 = models.Instructor.findOrCreate({
    where: {
      email: 'gba@purdue.edu',
      name: 'George Adams'
    }
  }).catch((err) => {
    console.log(err);
  });

  Promise.all([user, group]).then((data) => {
    const newUser = data[0];
    const newGroup = data[1];
    newUser.addGroup(newGroup);
  });

  Promise.all([course, prof1, prof2]).then((data) => {
    const newCourse = data[0];
    const newProf1 = data[1];
    const newProf2 = data[2];
    newCourse.addInstructor([newProf1, newProf2]);
  });

  Promise.all([course, user]).then((data) => {
    const newCourse = data[0];
    const newUser = data[1];
    newUser.addCourse(newCourse);
  });
});

module.exports = app;
