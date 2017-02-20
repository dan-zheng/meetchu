const models = require('../models');
const passport = require('passport');

/**
 * GET /signup
 * Sign up page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('account/signup', {
    title: 'Sign up'
  });
};

/**
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res, next) => {
  models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  }).then((user) => {
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.save(() => {
        return res.redirect('/');
      });
    });
  });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
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
      return res.redirect('/login');
    }
    req.login(user, (err2) => {
      if (err2) { return next(err2); }
      req.session.save(() => {
        return res.redirect('/');
      });
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.getLogout = (req, res) => {
  console.log('hi');
  req.logout();
  req.session.destroy(() => {
    res.redirect('/');
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
  req.body.user.addCourse(req.body.course);
  res.redirect('account/addCourses');
}
