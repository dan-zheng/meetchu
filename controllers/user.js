const models = require('../models');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


passport.use('local-signup', new LocalStrategy(
  {
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done){
    User.findOne(
      {
        'email' : email
      },
      function(err, user){
        if(err){
          return done(err);
        }
        if(user){
          return done(err, false);
        }
        var salt = bcrypt.genSalt();
        var user = User.Create(
          {
            where: {
              email: email,
              firstName: req.firstName,
              lastName: req.lastName,
              passwordHash: bcrypt.hash(password, salt),
              passwordSalt: salt;
            }
          }
        );

      }
    );
  }
));

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  res.render('login', {
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
  //res.json(req.body);
  res.redirect('/');
};
