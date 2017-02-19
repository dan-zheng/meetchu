const models = require('../models');
const passport = require('passport');

/**
 * GET /signup
 * Sign up page.
 */
exports.getSignup = (req, res) => {
  return res.render('account/signup', {
    title: 'Sign up'
  });
};

/**
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res) => {
  models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  }).then(() => {
    return res.redirect('/');
  });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  return res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * User login.
 */
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err1, user, info) => {
    if (err1) { return next(err1); }
    if (!user) {
      console.log('user doesn\'t exist');
      return res.redirect('/login');
    }
    return req.login(user, (err2) => {
      if (err2) { return next(err2); }
      // console.log(req.user);
      // console.log(req.session);
      return res.redirect('/');
    });
  })(req, res, next);
};
