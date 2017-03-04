/**
 * GET /meetings
 * Meetings page.
 */
exports.getMeetings = (req, res) => {
  return res.render('meetings/index', {
    title: 'Meetings'
  });
};
