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
 * GET /addCourses
 * Course adding page
 */
exports.getAddCourse = (req, res) => {
  res.render('account/addCourses', {
    title: 'Add Courses',
  });
}

/**
 * POST /addCourses
 * Add the course
 */
exports.postAddCourse = (req, res) => {
  console.log('adding course: ' + req.course);
  req.user.addCourse(req.course);
  res.redirect('account/addCourses');
}

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
