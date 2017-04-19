/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const algoliasearch = require('algoliasearch');
const Promise = require('bluebird');

const models = require('../models');
const personDao = require('../dao/person')(models);

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env', silent: process.env.NODE_ENV === 'production' });

/*
 * Algolia configuration.
 */
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const userIndex = client.initIndex('users');

passport.serializeUser = ((user, done) => done(null, user.id));

passport.deserializeUser = ((id, done) => {
  personDao.findById(id)
  .tap(maybePerson => maybePerson.cata(
    () => done('User not found', null),
    user => done(null, user)))
});

/**
 * Add user to Algolia.
 */
const addUserToAlgolia = (user) => {
  // Add user to Algolia index
  const userValues = {
    objectID: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email
  };
  return Promise.resolve(userIndex.addObjects([userValues]));
};

const oauthLogin = (oauthId, profile, done) => {
  const oauth = {};
  oauth[oauthId] = profile.id;

  const identity = Object.assign({
    email: profile.emails[0].value,
    first_name: profile.name.givenName,
    last_name: profile.name.familyName
  }, oauth);

  personDao.externalLogin(identity)
  .then((user) => {
    // if (userWasCreated) {
    //   return addUserToAlgolia(user, done);
    // }


    // return done(null, false, {
    //   message: `${profile.provider} account not found for email ${profile.emails[0].value}`
    // });
    return done(null, user);
  });
};

/**
 * Sign in using email and password.
 */
passport.use('signup', new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true
}, (req, email, password, done) => {
  userDao.signup({
    email: req.body.email,
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    password: req.body.password
  }).tap(result =>
    result.cata(
      err => done(err, null),
      user => done(null, user)
    )
  );
}));

passport.use('login', new LocalStrategy({
  usernameField: 'email',
}, (email, password, done) => {
  userDao.loginWithEmail({ email, password })
  .tap((result) => {
    result.cata(
      err => done(err, null),
      user => done(null, user)
    );
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
