const models = require('../models');

const maxMessages = 10;

const getChatsQuery = `
  SELECT chat.id, chat.name, chat.description, person.firstName, person.lastName, msg.message
  FROM Groups chat
  LEFT JOIN Messages msg
    INNER JOIN
    (SELECT id, groupId, MAX(timeSent) mostRecent
      FROM Messages
      GROUP BY groupId
    ) sub_msg ON msg.groupId = sub_msg.groupId AND msg.timeSent = sub_msg.mostRecent
  ON chat.id = msg.groupId
  LEFT JOIN Users person
  ON msg.senderId = person.id
`;

const getChatQuery = `
  SELECT *
  FROM (SELECT chat.name, person.firstName, person.lastName, msg.message, msg.timeSent
    FROM Groups AS chat
    JOIN Messages AS msg
    ON chat.id = msg.groupId
    JOIN Users AS person
    ON msg.senderId = person.id
    WHERE chat.id = ?
    ORDER BY msg.timeSent DESC
    LIMIT ?) messages
  ORDER BY messages.timeSent ASC
`;

const getChatMembers = `
  SELECT person.firstName, person.lastName, person.email
    FROM Users AS person
    JOIN UserGroup
    ON UserGroup.UserId = person.id
    WHERE UserGroup.GroupId = ?
    ORDER BY UserGroup.createdAt, person.firstName DESC
`;

/**
 * GET /chats
 * Chats page.
 */
exports.getChats = (req, res) => {
  models.sequelize.query(getChatsQuery, {
    type: models.sequelize.QueryTypes.SELECT
  }).then((qres) => {
    const groups = qres.map((group) => {
      const grp = {};
      grp.id = group.id;
      grp.name = group.name;
      grp.description = group.description;
      if (group.message) {
        grp.lastMessage = `${group.firstName} ${group.lastName[0]}: ${group.message}`;
      }
      return grp;
    });
    return res.render('chats/index', {
      title: 'Chats',
      groups
    });
  });
};

/**
 * GET /chats/:id
 * Chat page.
 */
exports.getChat = (req, res) => {
  const groupId = req.params.id;
  models.sequelize.query(getChatQuery, {
    replacements: [groupId, maxMessages],
    type: models.sequelize.QueryTypes.SELECT
  }).then((chat) => {
    const senderName = (first, last) => {
      return `${first} ${last.charAt(0)}`;
    };
    const sender = { id: req.user.id, name: senderName(req.user.firstName, req.user.lastName) };
    const chatName = chat.name;
    const messageHistory = chat.map((q) => {
      return {
        senderName: senderName(q.firstName, q.lastName),
        body: q.message,
        timeSent: q.timeSent
      };
    });
    models.sequelize.query(getChatMembers, {
      replacements: [groupId],
      type: models.sequelize.QueryTypes.SELECT
    }).then((members) => {
      const isAdmin = members.slice(0, 1).some((e, i, arr) => {
        return e.email === req.user.email;
      });
      return res.render('chats/chat', {
        title: chatName,
        tag: 'Chat',
        sender,
        groupId,
        messageHistory,
        isAdmin,
        members,
        maxMessages
      });
    });
  }).catch((err) => {
    req.flash('info', 'Chat does not exist.');
    return res.redirect(req.session.returnTo);
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
exports.postInviteChatGroup = (req, res) => {
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
exports.postLeaveChatGroup = (req, res) => {
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
exports.postDeleteChatGroup = (req, res) => {
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
