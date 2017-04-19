const models = require('../models');
const chatDao = require('../dao/chat')(models);

const MAX_MESSAGES = 10;

/**
 * GET /chats
 * Chats page.
 */
exports.getChats = (req, res) => {
  const person = req.body.user;

  chatDao.getChatList(person).then(result =>
    result.cata(
      err => res.status(401).json(err),
      chatList => res.status(200).json(chatList)
    )
  );
};

/**
 * GET /chats/:id
 * Chat page.
 */
exports.getChat = (req, res) => {
  const chat = req.params.chat;

  chatDao.getChatMessages(chat, MAX_MESSAGES).then(result =>
    result.cata(
      err => res.status(401).json(err),
      chatMessages => res.status(200).json(chatMessages)
    )
  );
};

/**
 * POST /chats/create
 * Create a chat.
 */
exports.postCreateChat = (req, res) => {
  req.assert('name', 'Chat name is empty.').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect('/chats');
  }
  // NOTE: description is empty string instead of NULL, possibly undesirable
  models.Group.create({
    name: req.body.name,
    description: req.body.description
    // groupType: req.body.groupType
  }).then((group) => {
    group.addUser(req.user);
    req.flash('success', 'Your chat has been created.');
    return res.redirect('/chats');
  });
};

/**
 * POST /chats/:id/invite
 * Invite a user to a chat group.
 */
exports.postInviteToChat = (req, res) => {
  const id = req.params.id;

  req.assert('email', 'Invitee field is not an email.').isEmail();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    return res.redirect(`/chats/${id}`);
  }

  const userEmail = req.body.email;

  models.Group.findOne({
    where: {
      id
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      return res.redirect('/chats');
    }
    models.User.findOne({
      where: {
        email: userEmail
      }
    }).then((user) => {
      if (!user) {
        req.flash('error', 'No user with that email exists.');
        return res.redirect(`/chats/${id}`);
      }
      group.hasUser(user).then((exists) => {
        if (exists) {
          req.flash('error', 'The user you tried to invite is already in the chat.');
          return res.redirect(`/chats/${id}`);
        }
        models.Notification.create({
          message: `You have been invited to the chat ${group.name}.`
        }).then((notification) => {
          user.addNotification(notification);
        });
        group.addUser(user);
        req.flash('success', `${user.firstName} has been invited.`);
        return res.redirect(`/chats/${id}`);
      });
    });
  });
};

/**
 * POST /chats/:id/leave
 * Leave a chat group.
 */
exports.postLeaveChat = (req, res) => {
  const id = req.params.id;
  models.Group.findOne({
    where: {
      id
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      return res.redirect('/chats');
    }
    group.hasUser(req.user).then((exists) => {
      if (!exists) {
        req.flash('error', 'You are not in the chat.');
        return res.redirect('/chats');
      }
      group.removeUser(req.user);
      if (group.Users.length <= 0) {
        req.flash('info', 'Your chat has been deleted.');
        return res.redirect('/chats');
      }
      req.flash('info', 'You have left the chat.');
      return res.redirect('/chats');
    });
  });
};

/**
 * POST /chats/:id/delete
 * Delete a chat group.
 */
exports.postDeleteChat = (req, res) => {
  const id = req.params.id;
  models.Group.findById(id).then((group) => {
    if (!group) {
      req.flash('error', 'The chat does not exist.');
      return res.redirect('/chats');
    }
    group.destroy().then(() => {
      req.flash('info', 'Your group has been deleted.');
      return res.redirect('/chats');
    });
  });
};

exports.getProto = (req, res) => {
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
      return res.render('chats/proto', {
        title: 'Chats',
        groups
      });
    }
    return res.render('chats/proto', {
      title: 'Chats'
    });
  });
};
