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
const flash = require('express-flash');
const validator = require('express-validator');
const nodemailer = require('nodemailer');

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
const authController = require('./controllers/auth');
const chatController = require('./controllers/chat');
const meetingController = require('./controllers/meeting');
const courseController = require('./controllers/course');

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');
const sequelizeStore = new SequelizeStore({
  db: models.sequelize
});

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
if (process.env.NODE_ENV !== 'production') {
  app.locals.pretty = true;
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sequelizeStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  saveUninitialized: true,
  resave: false,
  proxy: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/reset/) &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
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
app.get('/logout', userController.getLogout);
app.get('/account', passportConfig.isAuthenticated, userController.getProfile);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getPasswordReset);
app.post('/reset/:token', userController.postPasswordReset);
app.get('/chats', passportConfig.isAuthenticated, chatController.getChats);
app.post('/chats/:id/invite', passportConfig.isAuthenticated, chatController.postInviteChatGroup);
app.post('/chats/:id/leave', passportConfig.isAuthenticated, chatController.postLeaveChatGroup);
app.get('/courses', passportConfig.isAuthenticated, courseController.getCourses);
app.get('/courses/:id', passportConfig.isAuthenticated, courseController.getCourse);
app.post('/courses/add', passportConfig.isAuthenticated, courseController.postAddCourse);
app.post('/courses/remove/:id', passportConfig.isAuthenticated, courseController.postRemoveCourse);
app.post('/courses/auth', passportConfig.isAuthenticated, courseController.postAuthCourses);
app.get('/meetings', passportConfig.isAuthenticated, meetingController.getMeetings);
// app.post('/courses/auth', courseController.postAuthCourses);

/**
 * OAuth authentication routes.
 */
app.get('/auth/google', authController.getAuthGoogle);
app.get('/auth/google/callback', authController.getAuthGoogleCallback);

/**
 * Create any missing database tables and start Express server.
 */
models.sequelize.sync().then(() => {
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
});

module.exports = app;
