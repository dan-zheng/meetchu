const models = require('../models');

/**
 * GET /signup
 * Sign up page.
 */
exports.getSignup = (req, res) => {
  res.render('account/signup', {
    title: 'Sign up',
  });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  res.render('account/login', {
    title: 'Login',
  });
};

/**
 * POST /login
 * User login.
 */
exports.postLogin = (req, res) => {
  // Sample function
  console.log(req.body);
  // res.json(req.body);
  res.redirect('/');
};
