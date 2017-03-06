/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const algoliasearch = require('algoliasearch');
const models = require('../models');

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env' });

/*
 * Algolia configuration.
 */
// const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const client = algoliasearch(process.env.ALGOLIA_ID_OLD, process.env.ALGOLIA_ADMIN_KEY_OLD);
const userIndex = client.initIndex('users');

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  models.User.find({ where: { id } }).then((user) => {
    return done(null, user);
  }).catch((err) => {
    return done(err, null);
  });
});

/**
 * Add user to Algolia.
 */
const addUserToAlgolia = (user, done) => {
  // Add user to Algolia index
  const userValues = {
    objectID: user.dataValues.id,
    firstName: user.dataValues.firstName,
    lastName: user.dataValues.lastName,
    email: user.dataValues.email
  };
  userIndex.addObjects([userValues], (err, content) => {
    if (err) {
      return done(err);
    }
  });
  return done(null, user);
};

const oauthLogin = (oauthId, profile, done) => {
  const newUserFields = {
    email: profile.emails[0].value,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName
  };
  const query = {};
  query[oauthId] = profile.id;
  const opts = {};
  opts.where = query;
  opts.defaults = newUserFields;
  models.User.findOrCreate(opts)
    .spread((user, userWasCreated) => {
      if (userWasCreated) {
        return addUserToAlgolia(user, done);
      }
      return done(null, user);
    })
    .catch((err) => {
      return done(null, false, {
        message: `${profile.provider} account not found for email ${profile.emails[0].value}`
      });
    });
};

/**
 * Sign in using email and password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  models.User.find({ where: { email } }).then((user) => {
    if (!user) {
      return done(null, false, { message: `Email ${email} not found.` });
    }
    user.verifyPassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  }).catch((err) => {
    return done(err);
  });
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    oauthLogin('googleId', profile, done);
  });
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  passReqToCallback: true,
  profileFields: ['id', 'email', 'first_name', 'last_name']
}, (req, accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    oauthLogin('facebookId', profile, done);
  });
}));

/**
 * Middleware required for login.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
};
