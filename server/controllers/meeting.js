const models = require('../models');
const meetingDao = require('../dao/meeting')(models);

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

};

/**
 * POST /meetings/create
 * Create a meeting.
 */
exports.postCreateMeeting = (req, res) => {
  req.assert('name', 'Meeting name is empty.').notEmpty();
  req.assert('dates', 'No dates were selected.').notEmptyArray();
  req.assert('times', 'No times were selected.').notEmptyArray();

};

/**
 * POST /meetings/:id/update
 * Update meeting information.
 */
exports.postUpdateMeeting = (req, res) => {
  const id = req.params.id;

};

/**
 * POST /meetings/:id/rsvp
 * RSVP to a meeting.
 */
exports.postRsvpMeeting = (req, res) => {
  const id = req.params.id;

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
 * POST /meetings/:id/invite
 * Invite a user to a meeting.
 */
exports.postInviteMeeting = (req, res) => {
  const id = req.params.id;

  req.assert('email', 'Invitee field is not an email.').isEmail();

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
