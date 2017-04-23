const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const models = require('../models');

/**
 * GET /meetings
 * Meetings home page.
 */
exports.getMeetings = (req, res) => {

};

/**
 * GET /meetings/:id
 * Meetings page.
 */
exports.getMeeting = (req, res) => {
  const meetingId = req.params.id;

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

};

/**
 * POST /meetings/:id/unfinalize
 * Unfinalize meeting time.
 */
exports.postUnfinalizeMeeting = (req, res) => {
  const id = req.params.id;

};


/**
 * POST /meetings/:id/leave
 * Leave a meeting.
 */
exports.postLeaveChatGroup = (req, res) => {
  const id = req.params.id;

};

/**
 * POST /meetings/:id/delete
 * Delete a meeting.
 */
exports.postDeleteMeeting = (req, res) => {
  const id = req.params.id;

};
