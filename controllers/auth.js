const models = require('../models');
const passport = require('passport');

/**
 * Login authentication helper function.
 */
exports.loginCallback = ((strategy, req, res, next) => {
  passport.authenticate(strategy, (err1, user, info) => {
    if (err1) { return next(err1); }
    if (!user) {
      req.flash('error', info.msg);
      req.session.save(() => {
        return res.redirect('/login');
      });
    } else {
      req.login(user, (err2) => {
        if (err2) { return next(err2); }
        req.session.save(() => {
          return res.redirect('/');
        });
      });
    }
  })(req, res, next);
});

/**
 * GET /auth/google
 * Google user authentication.
 */
exports.getAuthGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });

/**
 * GET /auth/google/callback
 * Google user authentication callback.
 */
exports.getAuthGoogleCallback = (req, res, next) => {
  this.loginCallback('google', req, res, next);
};
