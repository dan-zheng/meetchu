const models = require('../models');
const meetingDao = require('../dao/meeting')(models);
const Either = require('monet').Either;

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
 * Get meeting by id.
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
 * POST /meeting/users
 * Get a meeting's users.
 */
exports.postMeetingUsers = (req, res) => {
  const meeting = req.body.meeting;

  meetingDao.getPeopleByMeeting(meeting).then(result =>
    result.cata(
      err => res.status(401).json(err),
      people => res.status(200).json(people.toArray())
    )
  );
};

/**
 * POST /meetings/create
 * Create a meeting.
 */
exports.postCreateMeeting = async (req, res) => {
  req.checkBody('meeting', 'Meeting was not specified');
  req.checkBody('meeting.time', 'Meeting times were not specified.');
  req.checkBody('creator', 'Meeting creator was not specified.');
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(401).json(errors);
  }

  const creator = req.body.creator;
  const people = req.body.users || [];
  const meeting = req.body.meeting;
  console.log(meeting.time);
  const createMeeting = await meetingDao.create(creator, meeting);
  const addPeople = await createMeeting.flatMap((createdMeeting) => {
    if (people.length === 0) {
      return Either.Right(0);
    }
    return meetingDao.addPeople(createdMeeting, people);
  });
  addPeople.cata(
    err => res.status(401).json(err),
    () => {
      console.log('hi');
      return res.status(200).json(createMeeting.right())}
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

  const meeting = req.body.meeting;
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
exports.postLeaveMeetingGroup = async (req, res) => {
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
