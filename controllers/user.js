const models = require('../models');
const passport = require('passport');

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
  req.body.user.addCourse(req.body.course);
  res.redirect('account/addCourses');
}
/**
 * POST /signup
 * User signup.
 */
exports.postSignup = (req, res) => {
  // Sample function
  console.log(req.body);
  models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  }).then(() => {
    return res.redirect('/');
  });
  // res.json(req.body);

};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  return res.render('account/login', {
    title: 'Login',
  });
};

/**
 * POST /login
 * User login.
 */
exports.postLogin = (req, res, next) => {
  // Sample function
  console.log(req.body);

  return passport.authenticate('local', {
    failureRedirect:'/login',
    successRedirect: '/'
  })(req, res, next);

  //passport.authenticate('local', (err, user, info) => {


    /*if (err) {return next(err);}
    if (!user) {
      console.log('user doesn\'t exist');
      return res.redirect('/login')
    }
    req.logIn(user, (err) => {
      if (err) {return next(err);}
      return res.redirect("/");
    });
  })(req, res, next);*/
};
