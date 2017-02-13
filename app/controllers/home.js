/**
 * GET /
 * Home page.
 */
module.exports.index = (req, res) => {
  res.render('home', {
    title: 'Home',
  });
};
