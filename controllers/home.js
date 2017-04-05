const models = require('../models');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  if (req.user) {
    req.user.getNotifications().then((notifications) => {
      return res.render('home', {
        title: 'Home',
        notifications
      });
    });
  } else {
    return res.render('home', {
      title: 'Home'
    });
  }
};
