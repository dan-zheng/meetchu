/**
 *  Module dependencies
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


/**
 *  Validate User
 */
passport.use(
  new LocalStrategy(
    (username, password, done) => {
      User.findOne({ username },
        (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false);
          if (!user.validPassword(password)) return done(null, false);
          return done(null, user);
        }
      );
    }
  )
);
