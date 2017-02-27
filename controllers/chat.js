const models = require('../models');

/**
 * GET /chats
 * Chats page.
 */
exports.getChats = (req, res) => {
  return res.render('chats/index', {
    title: 'Chats'
  });
};

/**
 * POST /chats/:id/leave
 * Leave a chat group.
 */
exports.postInviteChatGroup = (req, res) => {
  const groupId = req.params.id;
  const userId = req.body.userId;
  models.Group.findById(groupId).then((group) => {
    if (!group) {
      return res.redirect('/chats');
    }
    models.User.findById(userId).then((user) => {
      if (!user) {
        return res.redirect('/chats');
      }
      group.addUser(user);
      return res.redirect('/chats');
    });
  });
};

/**
 * POST /chats/:id/leave
 * Leave a chat group.
 */
exports.postLeaveChatGroup = (req, res) => {
  const groupId = req.params.id;
  models.Group.findById(groupId).then((group) => {
    if (!group) {
      return res.redirect('/chats');
    }
    group.removeUser(req.user);
    // TODO: if group size is 0, delete group
    return res.redirect('/chats');
  });
};