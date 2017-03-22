const models = require('../models');

/**
 * GET /meetings
 * Meetings home page.
 */
exports.getMeetings = (req, res) => {
  return res.render('meetings/index', {
    title: 'Meetings'
  });
};

/**
 * GET /meetings/:id
 * Meetings page.
 */
exports.getMeeting = (req, res) => {
  const meetingId = req.params.id;
  models.Meeting.findOne({
    where: {
      id: meetingId
    },
    include: [{
      model: models.User
    }]
  }).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'No meeting with the specificied id exists.');
      return res.redirect('/meetings');
    }
    meeting = meeting.dataValues;
    meeting.Users = meeting.Users.map((user) => {
      return user.dataValues;
    });
    return res.render('meetings/meeting', {
      title: meeting.Title,
      meeting
    });
  });
};
