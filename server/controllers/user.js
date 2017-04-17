const passport = require('passport');
const auth = require('./auth');
const async = require('async');
const crypto = require('crypto');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const algoliasearch = require('algoliasearch');
const pug = require('pug');
const Promise = require('bluebird');
const monet = require('monet');
const Either = monet.Either;
const Maybe = monet.Maybe;

const models = require('../models');
const userDao = require('../dao/user')(models);

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env', silent: process.env.NODE_ENV === 'production' });

/**
 * Nodemailer transport configuration.
 */
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD
  }
});

/**
 * Algolia configuration.
 */
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const userIndex = client.initIndex('users');

/**
 * GET /signup
 * Sign up page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('account/signup', {
    title: 'Sign up'
  });
};

/**
 * Adds a new user to algolia.
 * @param {User} user - a user model.
 * @return {Promise} a bluebird promise.
 */
function addUserToAlgolia(user) {
  // Add user to Algolia index
  const userValues = {
    objectID: user.dataValues.id,
    firstName: user.dataValues.firstName,
    lastName: user.dataValues.lastName,
    email: user.dataValues.email
  };
  return Promise.resolve(userIndex.addObjects([userValues]));
}

/**
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  passport.authenticate('signup', (err, user) => {
    if (err) {
      req.flash('error', err);
      return res.status(401).json(err);
    }
    return res.status(200).json(user);
  })(req, res, next);
}

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * User login.
 */
exports.postLogin = (req, res, next) => {
  auth.loginCallback('login', req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.getLogout = (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Password recovery.
 */
exports.getForgot = (req, res) => {
  return res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Send password recovery email.
 */
exports.postForgot = (req, res, next) => {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      models.User.findOne({ where: { email: req.body.email } }).then((user) => {
        if (!user) {
          req.flash('error', 'An account with that email address could not be found.');
          return res.redirect('/forgot');
        }
        // Recovery token will expire in one hour
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expirationDate;
        user.save().then(() => {
          done(null, token, user);
        });
      });
    },
    (token, user, done) => {
      const resetURL = `http://${req.headers.host}/reset/${token}`;
      const resetTemplate = pug.compileFile('views/email/reset.pug');
      const mailOpts = {
        to: user.email,
        from: process.env.SENDGRID_USERNAME,
        subject: 'Meetchu Password Reset',
        html: resetTemplate({ user, resetURL })
      };
      transporter.sendMail(mailOpts, (err) => {
        req.flash('info', `A password recovery email has been sent to ${user.email}.`);
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/forgot');
  });
};

/**
 * GET /reset
 * Password reset page.
 */
exports.getPasswordReset = (req, res) => {
  models.User.findOne({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    }
  }).then((user) => {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    return res.render('account/reset', {
      title: 'Reset password'
    });
  });
};

/**
 * POST /reset
 * Reset password.
 */
exports.postPasswordReset = (req, res) => {
  models.User.findOne({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    }
  }).then((user) => {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.setPassword(req.body.password, () => {
      user.save().then(() => {
        req.flash('success', 'Your password has been updated.');
        return res.redirect('/login');
      });
    });
  }).catch((err) => res.redirect('/'));
};

/**
 * GET /account
 * Account page.
 */
exports.getProfile = (req, res) => {
  return res.render('account/account', {
    title: 'Update profile'
  });
};

/**
 * POST /account/update
 * Update account information.
 */
exports.postUpdateAccount = (req, res) => {
  const updatedUser = new models.User(req.body.updatedUser);
  const fields = req.body.fields;

  updatedUser.updatePassword(updatedUser.password);

  userDao.update(updatedUser, fields).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      wasUpdated => res.status(200).json(updatedUser)
    )
  );
};

/**
 * GET /profile/:id
 * Get user public profile.
 */
exports.getPublicProfile = (req, res) => {
  const userId = req.params.id;
  models.User.findOne({
    where: {
      id: userId
    },
    include: [{
      model: models.Course
    }]
  }).then((user) => {
    const courses = user.Courses.map((course) => {
      return course.dataValues;
    });
    user = user.dataValues;
    user.Courses = courses;
    return res.render('account/profile', {
      title: 'Public Profile',
      user
    });
  }).catch((err) => {
    req.flash('info', 'User profile page does not exist.');
    return res.redirect(req.session.returnTo);
  });
};

/**
 * POST /profile/:id/chat
 * Create a chat with a user.
 */
exports.postPublicProfileCreateChat = (req, res) => {
  const id = req.params.id;

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect('/chats');
  }

  models.Group.create({
    name: 'Private Chat',
    description: req.body.description || '',
    // groupType: req.body.groupType
  }).then((group) => {
    group.addUser(req.user);
    models.User.findOne({
      where: {
        id
      }
    }).then((user) => {
      group.addUser(user);
      models.Notification.create({
        message: `You have been invited to chat with ${user.firstName}.`
      }).then((notification) => {
        user.addNotification(notification);
        req.flash('success', `Your chat with ${user.firstName} has been created.`);
        return res.redirect(`/chats/${group.id}`);
      });
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  userIndex.deleteObject(req.user.id, (err) => {
    if (err) {
      return next(err);
    }
  });
  req.user.destroy().then(() => {
    req.flash('info', 'Your account has been deleted.');
    return res.redirect('/');
  });
};
