const models = require('../models');
const passport = require('passport');
const auth = require('./auth');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pug = require('pug');
const resetTemplate = pug.compileFile('views/email/reset.pug');

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
    req.session.save(() => {
      return res.redirect('/signup');
    });
  }

  models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  }).then((user) => {
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.save(() => {
        return res.redirect(req.session.returnTo || '/');
      });
    });
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
          req.flash('error', 'Could not find an account under that email address.');
          req.session.save(() => {
            return res.redirect('/forgot');
          });
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
    if (err) { return next(err); }
    req.session.save(() => {
      return res.redirect('/forgot');
    });
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
      req.session.save(() => {
        return res.redirect('/forgot');
      });
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
exports.postPasswordReset = (req, res, next) => {
  models.User.findOne({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    }
  }).then((user) => {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      req.session.save(() => {
        return res.redirect('/');
      });
    }
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.setPassword(req.body.password, () => {
      user.save().then(() => {
        req.flash('success', 'Success! Your password has been updated.');
        req.session.save(() => {
          return res.redirect('/login');
        });
      });
    });
  }).catch((err) => {
    return res.redirect('/');
  });
};

/*
 * GET /account
 * Account page.
 */
exports.getProfile = (req, res) => {
  return res.render('account/profile', {
    title: 'Update profile'
  });
};

/*
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res) => {
  req.user.firstName = req.body.firstName || '';
  req.user.lastName = req.body.lastName || '';
  req.user.email = req.body.email;
  req.user.major = req.body.major;
  req.user.save().then(() => {
    req.flash('success', 'Your profile information has been updated.');
    req.session.save(() => {
      return res.redirect('/account');
    });
  });
};

/*
 * POST /account/password
 * Update password.
 */
exports.postUpdatePassword = (req, res) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    req.session.save(() => {
      return res.redirect('/account');
    });
  } else {
    req.user.set('password', req.body.password);
    req.user.save().then(() => {
      req.flash('success', 'Your password has been changed.');
      req.session.save(() => {
        return res.redirect('/account');
      });
    });
  }
};
