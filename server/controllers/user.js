const passport = require('passport');
const auth = require('./auth');
const async = require('async');
const crypto = require('crypto');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const algolia = require('../services/algolia');
const pug = require('pug');
const Promise = require('bluebird');
const monet = require('monet');
const Either = monet.Either;
const Maybe = monet.Maybe;

const models = require('../models');
const personDao = require('../dao/person')(models);

/**
 * Load environment variables from .env file
 */
dotenv.load({ path: '.env', silent: process.env.NODE_ENV === 'production' });

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
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm_password', 'Passwords do not match.').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });
  // TODO handle validation errors and update them to check the body not params

  passport.authenticate('signup', (err, person) => {
    if (err) {
      req.flash('error', err);
      return res.status(401).json(err);
    }
    algolia.add(algolia.index.users, person.algoliaView());
    return res.status(200).json(person.hide());
  })(req, res, next);
};

/**
 * POST /login
 * User login.
 */
exports.postLogin = (req, res, next) => {
  auth.loginCallback('login', req, res, next);
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
 * POST /account/update
 * Update account information.
 */
exports.postUpdateAccount = (req, res) => {
  const fields = req.body.fields;
  const password = req.body.user.password;
  const person = password ?
    new models.Person(req.body.user).withPassword(password) :
    new models.Person(req.body.user);

  personDao.update(person, fields).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => {
        algolia.update(algolia.index.users, person.algoliaView());
        return res.status(200).json(person)
      }
    )
  );
};

/**
 * POST /profile/:id
 * Get user public profile.
 */
exports.getProfile = (req, res) => {
  const id = req.params.id;

  personDao.findById(id).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      foundPerson => res.status(200).json(foundPerson.hide().publicView())
    )
  );
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  const person = req.body.user;

  personDao.erase(person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      (rowsChanged) => {
        algolia.remove(algolia.index.users, person.id);
        return res.status(200).json(rowsChanged);
      }
    )
  );
};
