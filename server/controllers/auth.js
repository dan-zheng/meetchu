const passport = require('passport');

/**
 * Authentication helper function.
 * Used by front-end to check if user is authenticated.
 */


/**
 * Login authentication helper function.
 */
exports.loginCallback = ((strategy, req, res, next) => {
  passport.authenticate(strategy, (err, user) => {
    if (err) {
      req.flash('error', err);
      return res.status(401).json(err);
    }
    const hiddenFields = ['password', 'confirmPassword'];
    hiddenFields.forEach((field) => {
      delete user[field];
    });
    return res.status(200).json(user);
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
