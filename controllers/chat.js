const models = require('../models');

/**
 * GET /chats
 * Chats page.
 */
exports.getChats = (req, res) => {
  models.Group.findAll({
    include: [{
      model: models.User,
      where: {
        id: req.user.dataValues.id
      }
    }]
  }).then((groups) => {
    if (groups) {
      groups = groups.map((group) => {
        return group.dataValues;
      });
      return res.render('chats/index', {
        title: 'Chats',
        groups
      });
    }
    return res.render('chats/index', {
      title: 'Chats'
    });
  });
};

/**
 * GET /chats/:id
 * Chat page.
 */
exports.getChat = (req, res) => {
  const groupId = req.params.id;
  models.Group.findOne({
    where: {
      id: groupId
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    group = group.dataValues;
    group.Users = group.Users.map((user) => {
      return user.dataValues;
    });
    return res.render('chats/chat', {
      title: group.name,
      group
    });
  });
};

/**
 * POST /chats/create
 * Create a chat group.
 */
exports.postCreateChatGroup = (req, res) => {
  req.assert('name', 'Chat name is empty.').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    req.session.save(() => {
      return res.redirect('/chats');
    });
  }

  models.Group.create({
    name: req.body.name,
    description: req.body.description || '',
    // groupType: req.body.groupType
  }).then((group) => {
    group.addUser(req.user);
    req.flash('success', 'Your chat has been created.');
    req.session.save(() => {
      return res.redirect('/chats');
    });
  });
};

/**
 * POST /chats/:id/invite
 * Invite a user to a chat group.
 */
exports.postInviteChatGroup = (req, res) => {
  req.assert('email', 'Invitee email is empty.').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    req.session.save(() => {
      return res.redirect('/chats');
    });
  }

  const groupId = req.params.id;
  const userEmail = req.body.email;
  models.Group.findOne({
    where: {
      id: groupId
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    } else {
      models.User.findOne({
        where: {
          email: req.body.email
        }
      }).then((user) => {
        if (!user) {
          req.flash('error', 'No user with that email exists.');
          req.session.save(() => {
            return res.redirect(`/chats/${groupId}`);
          });
        } else if (group.hasUser(user)) {
          req.flash('error', 'The user you tried to invite is already in the chat.');
          req.session.save(() => {
            return res.redirect(`/chats/${groupId}`);
          });
        } else {
          group.addUser(user);
          req.flash('success', `${user.firstName} has been invited.`);
          req.session.save(() => {
            return res.redirect(`/chats/${groupId}`);
          });
        }
      });
    }
  });
};

/**
 * POST /chats/:id/leave
 * Leave a chat group.
 */
exports.postLeaveChatGroup = (req, res) => {
  const groupId = req.params.id;
  models.Group.findOne({
    where: {
      id: groupId
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    } else if (!group.hasUser(req.user)) {
      req.flash('error', 'You are not in the chat.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    } else {
      group.removeUser(req.user);
      if (group.Users.length <= 0) {
        req.flash('info', 'Your chat has been deleted.');
        req.session.save(() => {
          return res.redirect('/chats');
        });
      } else {
        req.flash('info', 'You have left the chat.');
        req.session.save(() => {
          return res.redirect('/chats');
        });
      }
    }
  });
};

/**
 * POST /chats/:id/delete
 * delete a chat group.
 */
exports.postDeleteChatGroup = (req, res) => {
  const groupId = req.params.id;
  models.Group.findById(groupId).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    }
    group.destroy().then(() => {
      req.flash('info', 'Your group has been deleted.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    });
  });
};
