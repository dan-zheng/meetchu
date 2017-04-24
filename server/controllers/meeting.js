const models = require('../models');
const meetingDao = require('../dao/meeting')(models);

/**
 * GET /meetings
 * Meetings home page.
 */
exports.postMeetings = async (req, res) => {
  req.checkBody('user', 'User was not specified.');
  req.checkBody('user.id', 'User id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const person = req.body.user;
  meetingDao.findByPerson(person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      meetings => res.status(200).json(meetings.toArray())
    )
  );
};

/**
 * GET /meetings/:id
 * Meetings page.
 */
exports.postMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified.');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  meetingDao.findById(meeting.id).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      found => res.status(200).json(found)
    )
  );
};

/**
 * POST /meetings/create
 * Create a meeting.
 */
exports.postCreateMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.times', 'Meeting times were not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const person = req.body.person;
  const meeting = req.body.meeting;
  const times = req.body.times;
  const createMeeting = await meetingDao.create(person, meeting);
  const addTimes = await createMeeting.flatMap(
    createdMeeting => meetingDao.setMeetingTimes(createdMeeting, times)
  );
  addTimes.cata(
    err => res.status(401).json(err),
    createdMeeting => res.status(200).json(createdMeeting)
  );
};

/**
 * POST /meetings/:id/update
 * Update meeting information.
 */
exports.postUpdateMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  const fields = req.body.fields;
  meetingDao.update(meeting, fields).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => res.status(200).json(meeting)
    )
  );
};

/**
 * POST /meetings/:id/rsvp
 * RSVP to a meeting.
 */
exports.postRsvpMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  req.checkBody('user', 'User was not specified.');
  req.checkBody('user.id', 'User id  was not specified.');
  req.checkBody('times', 'Times were not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meetings;
  const person = req.body.user;
  const times = req.body.times;
  meetingDao.setPersonTimes(meeting, person, times).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(affectedRows)
    )
  );
};

/**
 * POST /meetings/:id/finalize
 * Finalize meeting time.
 */
exports.postFinalizeMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const time = req.body.time;
  const meeting = req.body.meeting;
  meetingDao.update(meeting, ['final_time']).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => res.status(200).json(meeting)
    )
  );
};

/**
 * POST /meetings/:id/unfinalize
 * Unfinalize meeting time.
 */
exports.postUnfinalizeMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  delete meeting.final_time;
  meetingDao.update(meeting, ['final_time']).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => res.status(200).json(meeting)
    )
  );
};

/**
 * POST /meetings/:id/invite
 * Invite users to meeting.
 */
exports.postInviteMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified.');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  req.checkBody('users', 'Users must be a non-empty array').nonEmptyArray();
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  const people = req.body.users;
  meetingDao.addPeople(meeting, people).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(affectedRows)
    )
  );
};


/**
 * POST /meetings/:id/leave
 * Leave a meeting.
 */
exports.postLeaveChatGroup = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified.');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  req.checkBody('meeting.creator_id', 'Meeting creator id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  const person = req.body.user;
  meetingDao.leave(meeting, person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(affectedRows)
    )
  );
};

/**
 * POST /meetings/:id/delete
 * Delete a meeting.
 */
exports.postDeleteMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified.');
  req.checkBody('meeting.id', 'Meeting id was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const meeting = req.body.meeting;
  meetingDao.erase(meeting).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(affectedRows)
    )
  );
};
