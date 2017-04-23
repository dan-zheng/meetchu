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

/**
 * Algolia.
 */
 /*
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const userIndex = client.initIndex('users');
const addUserToAlgolia = (user) => {
  // Add user to Algolia index
  const userValues = {
    objectID: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
  };
  return userIndex.addObjects([userValues]);
};*/

passport.serializeUser = ((user, done) => done(null, user.id));

passport.deserializeUser = ((id, done) =>
  personDao.findById(id).tap(result =>
    result.cata(
      () => done('User not found', null),
      user => done(null, user)
    )
));

function oauthLogin(oauthId, profile, done) {
  const identity = {
    email: profile.emails[0].value,
    first_name: profile.name.givenName,
    last_name: profile.name.familyName,
    [oauthId]: profile.id
  };

  return personDao.externalLogin(identity).tap(result =>
    result.cata(
      err => done(err, null),
      person => done(null, person)
    ));
}

/**
 * Sign in using email and password.
 */
passport.use('signup', new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true
}, (req, email, password, done) => {
  const person = new models.Person({
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name
  }).withPassword(password);
  personDao.signup(person).tap(result =>
    result.cata(
      err => done(err, null),
      person => done(null, person)
    )
  );
}));

passport.use('login', new LocalStrategy({
  usernameField: 'email',
}, (email, password, done) => {
  personDao.loginWithEmail({ email, password })
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
