const models = require('../models');
const passport = require('passport');
const auth = require('./auth');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const algoliasearch = require('algoliasearch');
const pug = require('pug');

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
// const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const client = algoliasearch(process.env.ALGOLIA_ID_OLD, process.env.ALGOLIA_ADMIN_KEY_OLD);
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
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/signup');
  }
  models.User.findOrCreate({
    where: {
      email: req.body.email
    },
    defaults: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password
    }
  }).spread((user, wasCreated) => {
    if (!wasCreated) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/signup');
    }
    // Add user to Algolia index
    const userValues = {
      objectID: user.dataValues.id,
      firstName: user.dataValues.firstName,
      lastName: user.dataValues.lastName,
      email: user.dataValues.email
    };
    userIndex.addObjects([userValues], (err, content) => {
      if (err) {
        return next(err);
      }
    });
    // Log in with Passport
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(req.session.returnTo || '/');
    });
  }).catch((err) => {
    req.flash('error', 'Database error: user was not created.');
    return res.redirect('/signup');
  });
};

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
  auth.loginCallback('local', req, res, next);
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
 * POST /login
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
  }).catch((err) => {
    return res.redirect('/');
  });
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
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res) => {
  req.user.firstName = req.body.firstName || '';
  req.user.lastName = req.body.lastName || '';
  req.user.email = req.body.email;
  req.user.major = req.body.major;
  req.user.privacyShowEmail = req.body.privacyShowEmail === 'on';
  req.user.privacyShowMajor = req.body.privacyShowMajor === 'on';
  req.user.privacyShowProfilePicture = req.body.privacyShowProfilePicture === 'on';
  req.user.save().then(() => {
    req.flash('success', 'Your profile information has been updated.');
    return res.redirect('/account');
  });
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
 * Update password.
 */
exports.postPublicProfileCreateChat = (req, res) => {
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/chats');
  }
  models.Group.create({
    name: 'Private Chat',
    description: req.body.description || '',
    // groupType: req.body.groupType
  }).then((group) => {
    group.addUser(req.user);
    req.flash('success', 'Your chat has been created.');
    return res.redirect('/chats');
  });
};

/**
 * POST /account/password
 * Update password.
 */
exports.postUpdatePassword = (req, res) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/account');
  }
  req.user.set('password', req.body.password);
  req.user.save().then(() => {
    req.flash('success', 'Your password has been updated.');
    return res.redirect('/account');
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
