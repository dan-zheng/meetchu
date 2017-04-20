/**
 * Module dependencies.
 */
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require('passport');
const jwt = require('express-jwt');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const flash = require('express-flash');
const validator = require('express-validator');
const nodemailer = require('nodemailer');

/**
 * Load environment variables from .env file.
 */
dotenv.load({ path: '.env', silent: process.env.NODE_ENV === 'production' });

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
    tableName: 'sessions'
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client', 'dist'), { maxAge: 31557600000 }));
} else {
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
}

/*
 * App routes.
 */
// TODO: Rewrite authentication
app.get('/', homeController.index);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.post('/login', userController.postLogin);
app.get('/logout', userController.getLogout);
app.post('/account/update', userController.postUpdateAccount);
app.post('/account/delete', userController.postDeleteAccount);

app.get('/profile/:id', userController.getProfile);

app.post('/chats', chatController.postChats);
app.post('/chat/users', chatController.postChatUsers);
app.post('/chats/create', chatController.postCreateChat);
app.post('/chats/add', chatController.postChatAddUser);
app.post('/chats/leave', chatController.postChatRemoveUser);
app.post('/chats/delete', chatController.postDeleteChat);

app.post('/courses', courseController.postCourses);
app.post('/course/users', courseController.postCourseUsers);
app.post('/course/add', courseController.postCourseAddUser);
app.post('/course/remove/', courseController.postCourseRemoveUser);
app.post('/courses/sync', courseController.postCoursesSyncUser);

app.get('/meetings', meetingController.getMeetings);
app.get('/meetings/:id', meetingController.getMeeting);
app.post('/meetings/create', meetingController.postCreateMeeting);
app.post('/meetings/:id/invite', meetingController.postInviteMeeting);
app.post('/meetings/:id/update', meetingController.postUpdateMeeting);
app.post('/meetings/:id/rsvp', meetingController.postRsvpMeeting);
app.post('/meetings/:id/finalize', meetingController.postFinalizeMeeting);
app.post('/meetings/:id/unfinalize', meetingController.postUnfinalizeMeeting);
app.post('/meetings/:id/delete', meetingController.postDeleteMeeting);

app.post('/notifications/create', notificationController.createNotification);

/**
 * OAuth authentication routes.
 */
app.get('/auth/google', authController.getAuthGoogle);
app.get('/auth/google/callback', authController.getAuthGoogleCallback);
app.get('/auth/facebook', authController.getAuthFacebook);
app.get('/auth/facebook/callback', authController.getAuthFacebookCallback);

/**
 * Socket.io configuration.
 */
io.on('connection', (socket) => {
  socket.on('send_message', (req) => {
    console.log(`Message received from user id ${req.senderId}: '${req.text}'`);
  });
  /*
  socket.on('send message', (rec) => {
    models.Message.create({
      senderId: rec.senderId,
      groupId: rec.groupId,
      message: rec.message.body
    });
    io.emit(`receive message ${rec.groupId}`, rec.message);
  });
  */
});

async function run() {
  /**
   * Create any missing database tables and start Express server.
   */
  await models.sync();

  /* Testing Playground */

  const personDao = require('./dao/person')(models);
  const courseDao = require('./dao/course')(models);
  const chatDao = require('./dao/chat')(models);
  const Either = require('monet').Either;

  /*
  const findPerson = await personDao.findByEmail('era878@gmail.com');
  const createChat = await findPerson.flatMap(
    found => chatDao.create({ name: 'HELLO', description: 'WORLD' })
  );
  const addPerson = await createChat.flatMap(
    found => chatDao.addPerson(createChat.right(), findPerson.right())
  );
  const addMessage = await addPerson.flatMap(
    found => chatDao.addMessage({
      sender_id: findPerson.right().id,
      chat_id: createChat.right().id,
      message: 'LOL'
    }));
  */

  http.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
}

run();
module.exports = app;
