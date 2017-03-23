const models = require('../models');

/**
 * GET /meetings
 * Meetings home page.
 */
exports.getMeetings = (req, res) => {
  models.Meeting.findAll({
    include: [{
      model: models.User,
      where: {
        id: req.user.dataValues.id
      }
    }]
  }).then((meetings) => {
    if (meetings) {
      meetings = meetings.map((meeting) => {
        return meeting.dataValues;
      });
      return res.render('meetings/index', {
        title: 'Meetings',
        tag: 'Meeting',
        meetings
      });
    }
    return res.render('meetings/index', {
      title: 'Meetings',
      tag: 'Meeting',
    });
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
      req.flash('error', 'No meeting with the specified id exists.');
      return res.redirect('/meetings');
    }
    meeting = meeting.dataValues;
    meeting.Users = meeting.Users.map((user) => {
      return user.dataValues;
    });
    return res.render('meetings/meeting', {
      title: meeting.name,
      tag: 'Meeting',
      meeting
    });
  });
};

/**
 * POST /meetings/create
 * Create a meeting.
 */
exports.postCreateMeeting = (req, res) => {
  req.assert('name', 'Meeting name is empty.').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/meetings');
  }
  models.Meeting.create({
    name: req.body.name,
    description: req.body.description || ''
  }).then((meeting) => {
    meeting.addUser(req.user);
    meeting.createDateTime({
      dateTime: new Date()
    });
    req.flash('success', 'Your meeting has been created.');
    return res.redirect('/meetings');
  });
};
