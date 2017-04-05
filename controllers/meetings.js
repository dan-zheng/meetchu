const async = require('async');

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
    include: [
      {
        model: models.User
      },
      {
        model: models.DateTime
      }
    ],
    order: [[models.DateTime, 'dateTime', 'ASC']]
  }).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'No meeting with the specified id exists.');
      return res.redirect('/meetings');
    }
    meeting = meeting.dataValues;
    meeting.Users = meeting.Users.map((user) => {
      return user.dataValues;
    });
    meeting.DateTimes = meeting.DateTimes.map((datetime) => {
      return datetime.dataValues;
    });
    console.log(meeting);
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
  req.assert('dates', 'No dates were selected.').notEmptyArray();
  req.assert('times', 'No times were selected.').notEmptyArray();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect('/meetings');
  }

  const dates = req.body.dates;
  const times = req.body.times;
  const datetimes = getDateTimes(dates, times);

  models.Meeting.create({
    name: req.body.name,
    description: req.body.description || ''
  }).then((meeting) => {
    meeting.addUser(req.user);
    async.eachOfLimit(datetimes, 1, (datetime, index, callback) => {
      meeting.createDateTime({
        dateTime: new Date(datetime)
      }).then((a) => {
        console.log(a);
        callback();
      }).catch((err) => {
        callback(err);
      });
    }, (err) => {
      if (err) {
        req.flash('error', 'Database error: meeting times could not be added.');
        return res.redirect('/meetings');
      }
      req.flash('success', 'Your meeting has been created.');
      return res.redirect('/meetings');
    });
  });
};

/**
 * POST /meetings/:id/delete
 * Delete a meeting.
 */
exports.postDeleteMeeting = (req, res) => {
  const id = req.params.id;
  models.Meeting.findById(id).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'The meeting does not exist.');
      return res.redirect('/meetings');
    }
    meeting.destroy().then(() => {
      req.flash('info', 'Your meeting has been deleted.');
      return res.redirect('/meetings');
    });
  });
};

const getDateTimes = (dates, times) => {
  const datetimes = [];
  const morning = times.indexOf('morning') !== -1;
  const afternoon = times.indexOf('afternoon') !== -1;
  const evening = times.indexOf('evening') !== -1;

  for (let i = 0; i < dates.length; i += 1) {
    if (morning) {
      for (let j = 8; j <= 11; j += 1) {
        const date = new Date(dates[i]);
        date.setHours(j);
        date.setMinutes(0);
        datetimes.push(date);
        const date2 = new Date(date);
        date2.setMinutes(30);
        datetimes.push(date2);
      }
    }
    if (afternoon) {
      for (let j = 13; j <= 16; j += 1) {
        const date = new Date(dates[i]);
        date.setHours(j);
        date.setMinutes(0);
        datetimes.push(date);
        const date2 = new Date(date);
        date2.setMinutes(30);
        datetimes.push(date2);
      }
    }
    if (evening) {
      for (let j = 18; j <= 21; j += 1) {
        const date = new Date(dates[i]);
        date.setHours(j);
        date.setMinutes(0);
        datetimes.push(date);
        const date2 = new Date(date);
        date2.setMinutes(30);
        datetimes.push(date2);
      }
    }
  }
  return datetimes;
};
