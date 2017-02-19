/**
 * Module dependencies
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const models = require('../models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  models.User.find({ where: { id } }).success((user) => {
    done(null, user);
  }).error((err) => {
    done(err, null);
  });
});

/**
 * Sign in using email and password.
 */
passport.use(new LocalStrategy((email, password, done) => {
  console.log("test");
  models.User.find({ where: { email } }).success((user) => {
    if (!user) {
      console.log("email not found");
      done(null, false, { message: `Email #{email} not found.` });
    }
    console.log("email found");
    user.verifyPassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  }).error((err) => {
    done(err);
  });
}));
