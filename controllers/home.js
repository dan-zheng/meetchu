/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  return res.render('home', {
    title: 'Home'
  });
};
