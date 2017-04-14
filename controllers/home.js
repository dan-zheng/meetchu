/**
 * GET /
 * Home page.
 */
 /*
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
*/

exports.index = (req, res) => {
  res.render('home', {
    title: 'Home',
  });
};
