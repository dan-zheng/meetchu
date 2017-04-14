/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const flash = require('express-flash');
const validator = require('express-validator');
const nodemailer = require('nodemailer');

/**
 * Load environment variables from .env file.
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.load({ path: '.env' });
}

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
const chatController = require('./controllers/chats');
const meetingController = require('./controllers/meetings');
const courseController = require('./controllers/courses');
const notificationController = require('./controllers/notification');

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  schema: {
    tableName: 'Sessions'
  }
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(logger('dev'));
if (process.env.NODE_ENV !== 'production') {
  app.locals.pretty = true;
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(validator({
  customValidators: {
    isArray(value) {
      console.log('value: ' + value);
      console.log('isArray: ' + Array.isArray(value));
      return Array.isArray(value);
    },
    notEmptyArray(value) {
      return Array.isArray(value) && value.length > 0;
    },
    notEmptyObjArray(obj) {
      if (obj === null || typeof obj !== 'object') {
        return false;
      }
      Object.keys(obj).map((key) => {
        if (!Array.isArray(obj[key]) || obj[key] === 0) {
          return false;
        }
        return true;
      });
      return true;
    }
  }
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  saveUninitialized: true,
  resave: true,
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
  // Force responses with code 304 to have code 200
  req.headers['if-none-match'] = 'no-match-for-this';
  // Save last visited valid page
  req.on('end', () => {
    if (res.statusCode === 200 && req.path !== '/login' && req.path !== '/signup' && !req.path.match(/^\/reset/)
        && !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
      req.session.returnTo = req.path;
      req.session.save();
    }
  });
  next();
});
app.use(express.static(path.join(__dirname, '../client', 'dist'), { maxAge: 31557600000 }));

/*
 * App routes.
 */
/*
app.get('/', (req, res) => {
  console.log('hi');
});
*/
app.get('/api/', homeController.index);
app.get('/api/signup', userController.getSignup);
app.post('/api/signup', userController.postSignup);
app.get('/api/login', userController.getLogin);
app.post('/api/login', userController.postLogin);
app.get('/api/logout', userController.getLogout);
app.get('/api/account', passportConfig.isAuthenticated, userController.getProfile);
app.post('/api/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/api/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/api/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/api/profile/:id', passportConfig.isAuthenticated, userController.getPublicProfile);
app.post('/api/profile/:id/chat', passportConfig.isAuthenticated, userController.postPublicProfileCreateChat);
app.get('/api/forgot', userController.getForgot);
app.post('/api/forgot', userController.postForgot);
app.get('/api/reset/:token', userController.getPasswordReset);
app.post('/api/reset/:token', userController.postPasswordReset);
app.get('/api/chats', passportConfig.isAuthenticated, chatController.getChats);
// temp
app.get('/api/chats/proto', passportConfig.isAuthenticated, chatController.getProto);
//----
app.get('/api/chats/:id', passportConfig.isAuthenticated, chatController.getChat);
app.post('/api/chats/create', passportConfig.isAuthenticated, chatController.postCreateChatGroup);
app.post('/api/chats/:id/invite', passportConfig.isAuthenticated, chatController.postInviteChatGroup);
app.post('/api/chats/:id/leave', passportConfig.isAuthenticated, chatController.postLeaveChatGroup);

app.post('/api/chats/:id/delete', passportConfig.isAuthenticated, chatController.postDeleteChatGroup);
app.get('/api/courses', passportConfig.isAuthenticated, courseController.getCourses);
app.get('/api/courses/:id', passportConfig.isAuthenticated, courseController.getCourse);
app.post('/api/courses/add', passportConfig.isAuthenticated, courseController.postAddCourse);
app.post('/api/courses/remove/:id', passportConfig.isAuthenticated, courseController.postRemoveCourse);
app.post('/api/courses/auth', passportConfig.isAuthenticated, courseController.postAuthCourses);
app.get('/api/meetings', passportConfig.isAuthenticated, meetingController.getMeetings);
app.get('/api/meetings/:id', passportConfig.isAuthenticated, meetingController.getMeeting);
app.post('/api/meetings/create', passportConfig.isAuthenticated, meetingController.postCreateMeeting);
app.post('/api/meetings/:id/invite', passportConfig.isAuthenticated, meetingController.postInviteMeeting);
app.post('/api/meetings/:id/update', passportConfig.isAuthenticated, meetingController.postUpdateMeeting);
app.post('/api/meetings/:id/rsvp', passportConfig.isAuthenticated, meetingController.postRsvpMeeting);
app.post('/api/meetings/:id/finalize', passportConfig.isAuthenticated, meetingController.postFinalizeMeeting);
app.post('/api/meetings/:id/unfinalize', passportConfig.isAuthenticated, meetingController.postUnfinalizeMeeting);
app.post('/api/meetings/:id/delete', passportConfig.isAuthenticated, meetingController.postDeleteMeeting);

app.post('/api/notifications/create', passportConfig.isAuthenticated, notificationController.createNotification);

/**
 * OAuth authentication routes.
 */
app.get('/api/auth/google', authController.getAuthGoogle);
app.get('/api/auth/google/callback', authController.getAuthGoogleCallback);
app.get('/api/auth/facebook', authController.getAuthFacebook);
app.get('/api/auth/facebook/callback', authController.getAuthFacebookCallback);

/**
 * Socket.io configuration.
 */
io.on('connection', (socket) => {
  socket.on('send message', (rec) => {
    models.Message.create({
      senderId: rec.senderId,
      groupId: rec.groupId,
      message: rec.message.body
    });
    io.emit(`receive message ${rec.groupId}`, rec.message);
  });
});

/**
 * Create any missing database tables and start Express server.
 */
models.sequelize.sync().then(() => {
  http.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
});

module.exports = app;
