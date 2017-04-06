const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const models = require('../models');

/**
 * GET /meetings
 * Meetings home page.
 */
exports.getMeetings = (req, res) => {
  models.Meeting.findAll({
    include: [
      {
        model: models.User,
        where: {
          id: req.user.dataValues.id
        }
      },
      {
        model: models.DateTime,
        attributes: ['dateTime'],
        as: 'finalTime'
      }
    ],
    order: [['updatedAt', 'DESC']]
  }).then((meetings) => {
    console.log(JSON.stringify(meetings, null, 2));
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
        model: models.DateTime,
        attributes: ['dateTime'],
        as: 'finalTime'
      },
      {
        model: models.DateTime,
        attributes: ['dateTime'],
        include: [
          {
            model: models.User
          }
        ]
      }
    ],
    order: [
      [models.User, models.UserMeeting, 'createdAt', 'ASC'],
      [models.DateTime, 'dateTime', 'ASC']
    ]
  }).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'No meeting with the specified id exists.');
      return res.redirect('/meetings');
    }
    meeting = meeting.dataValues;

    meeting.Users = meeting.Users.map((user) => {
      return user.dataValues;
    });

    const isAdmin = meeting.Users[0].id === req.user.id;
    console.log(isAdmin);

    meeting.DateTimes = meeting.DateTimes.map((datetime) => {
      return datetime.dataValues;
    });

    let datetimes = meeting.DateTimes.map((datetime) => {
      return datetime.dateTime;
    });

    let dates = datetimes.map((datetime) => {
      return moment(datetime.toUTCString()).format('dd M/D');
    });
    dates = dates.filter((datetime, index) => {
      return dates.indexOf(datetime) === index;
    });

    let times = _.groupBy(datetimes, (datetime) => {
      return moment(datetime).format('h:mm A');
    });
    times = _.mapValues(times, (val, key) => {
      const temp = val.map((datetime) => {
        return moment(datetime.toUTCString()).format('dd M/D');
      });
      return temp;
    });

    meeting.DateTimes = _.groupBy(meeting.DateTimes, (datetime) => {
      // return moment(datetime).startOf('day').format();
      return moment(datetime.dateTime).format('h:mm A');
    });
    datetimes = _.groupBy(datetimes, (datetime) => {
      // return moment(datetime).startOf('day').format();
      return moment(datetime).format('h:mm A');
    });

    // console.log(meeting.DateTimes);
    console.log(datetimes);
    console.log(times);
    console.log(dates);
    return res.render('meetings/meeting', {
      title: meeting.name,
      tag: 'Meeting',
      meeting,
      datetimes,
      dates,
      times,
      isAdmin
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
    location: req.body.location,
    description: req.body.description
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
 * POST /meetings/:id/update
 * Update meeting information.
 */
exports.postUpdateMeeting = (req, res) => {
  const id = req.params.id;

  req.assert('name', 'Meeting name is empty.').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect(`/meetings/${id}`);
  }

  models.Meeting.findById(id).then((meeting) => {
    meeting.name = req.body.name || meeting.name;
    meeting.location = req.body.location || meeting.location;
    meeting.description = req.body.description || meeting.description;
    meeting.save().then(() => {
      req.flash('success', 'Your meeting has been updated.');
      return res.redirect(`/meetings/${id}`);
    });
  });
};

/**
 * POST /meetings/:id/rsvp
 * RSVP to a meeting.
 */
exports.postRsvpMeeting = (req, res) => {
  const id = req.params.id;

  // req.assert('datetimes', 'No RSVP times were selected.').notEmptyObjArray();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect(`/meetings/${id}`);
  }

  let _selected = req.body.selected || [];
  let _deselected = req.body.deselected || [];

  if (_selected.length === 0 && _deselected.length === 0) {
    req.flash('error', 'No RSVP preferences were changed.');
    return res.redirect(`/meetings/${id}`);
  }

  _selected = _selected.map((datetime) => {
    return new Date(datetime);
  });
  _deselected = _deselected.map((datetime) => {
    return new Date(datetime);
  });
  _selected.sort((a, b) => {
    return new Date(a) - new Date(b);
  });
  _deselected.sort((a, b) => {
    return new Date(a) - new Date(b);
  });
  console.log('_selected');
  console.log(_selected);
  console.log('_deselected');
  console.log(_deselected);

  models.DateTime.findAll({
    where: {
      MeetingId: id
    },
    order: [['dateTime', 'ASC']]
  }).then((datetimes) => {
    let j = 0;
    let k = 0;
    async.eachOfLimit(datetimes, 1, (dt, index, callback) => {
      const dt1 = dt.dataValues.dateTime.getTime();
      const dt2 = j < _selected.length ? _selected[j].getTime() : null;
      const dt3 = k < _deselected.length ? _deselected[k].getTime() : null;
      if (j < _selected.length && dt1 === dt2) {
        dt.addUser(req.user).then(() => {
          j += 1;
          callback();
        });
      } else if (k < _deselected.length && dt1 === dt3) {
        dt.removeUser(req.user).then(() => {
          k += 1;
          callback();
        });
      } else {
        callback();
      }
    }, (err) => {
      req.flash('success', 'You have updated your RSVP preferences for the meeting.');
      return res.redirect(`/meetings/${id}`);
    });
  });
};

/**
 * POST /meetings/:id/finalize
 * Finalize meeting time.
 */
exports.postFinalizeMeeting = (req, res) => {
  const id = req.params.id;

  req.assert('finalTime', 'A final time was not selected.').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect(`/meetings/${id}`);
  }

  const finalTime = new Date(req.body.finalTime);

  models.Meeting.findOne({
    where: {
      id
    },
    include: [{
      model: models.DateTime,
      where: {
        dateTime: finalTime
      }
    }]
  }).then((meeting) => {
    meeting.finalTimeId = meeting.DateTimes[0].id;
    meeting.save().then(() => {
      req.flash('success', 'Your meeting time has been finalized.');
      return res.redirect(`/meetings/${id}`);
    });
  });
};

/**
 * POST /meetings/:id/invite
 * Invite a user to a meeting.
 */
exports.postInviteMeeting = (req, res) => {
  const id = req.params.id;

  req.assert('email', 'Invitee field is not an email.').isEmail();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect(`/meetings/${id}`);
  }

  const userEmail = req.body.email;

  models.Meeting.findOne({
    where: {
      id
    },
    include: [{
      model: models.User
    }]
  }).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'The meeting does not exist.');
      return res.redirect('/meetings');
    }
    models.User.findOne({
      where: {
        email: userEmail
      }
    }).then((user) => {
      if (!user) {
        req.flash('error', 'No user with that email exists.');
        return res.redirect(`/meetings/${id}`);
      }
      meeting.hasUser(user).then((exists) => {
        if (exists) {
          req.flash('error', 'The user you tried to invite is already in the meeting.');
          return res.redirect(`/meetings/${id}`);
        }
        models.Notification.create({
          message: `You have been invited to the meeting ${meeting.name}.`
        }).then((notification) => {
          user.addNotification(notification);
        });
        meeting.addUser(user);
        req.flash('success', `${user.firstName} has been invited.`);
        return res.redirect(`/meetings/${id}`);
      });
    });
  });
};


/**
 * POST /meetings/:id/leave
 * Leave a meeting.
 */
exports.postLeaveChatGroup = (req, res) => {
  const id = req.params.id;
  models.Meeting.findOne({
    where: {
      id
    },
    include: [{
      model: models.User
    }]
  }).then((meeting) => {
    if (!meeting) {
      req.flash('error', 'The meeting does not exist.');
      return res.redirect('/meetings');
    }
    meeting.hasUser(req.user).then((exists) => {
      if (!exists) {
        req.flash('error', 'You are not in the meeting.');
        return res.redirect('/meetings');
      }

      if (meeting.Users.length > 1) {
        meeting.removeUser(req.user).then(() => {
          req.flash('info', 'You have left the meeting.');
          return res.redirect('/meetings');
        });
      } else {
        meeting.destroy().then(() => {
          req.flash('info', 'Your meeting has been deleted.');
          return res.redirect('/meetings');
        });
      }
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
