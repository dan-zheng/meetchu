const passport = require('passport');

/**
 * Login authentication helper function.
 */
exports.loginCallback = ((strategy, req, res, next) => {
  passport.authenticate(strategy, (err1, optionalUser, info) => {
    if (err1) return next(err1);
    optionalUser.fold(() => {
      req.flash('error', info.msg);
      res.redirect('/login');
    }, (user) => {
      req.login(user, (err2) => {
        if (err2) return next(err2);
        res.redirect('/');
      });
    });
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

/**
 * GET /auth/facebook
 * Facebook user authentication.
 */
exports.getAuthFacebook = passport.authenticate('facebook', { scope: ['public_profile', 'email'] });

/**
 * GET /auth/facebook/callback
 * Facebook user authentication callback.
 */
exports.getAuthFacebookCallback = (req, res, next) => {
  this.loginCallback('facebook', req, res, next);
};
