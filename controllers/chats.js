const models = require('../models');
const MAX_MESSAGES = 10;

/**
 * GET /chats
 * Chats page.
 */
exports.getChats = (req, res) => {
  models.sequelize.query(`
    SELECT chat.id, chat.name, chat.description, person.firstName, person.lastName, msg.message
    FROM Groups chat
    LEFT JOIN Messages msg
    	INNER JOIN
    	(SELECT id, groupId, MAX(id) maxId
    		FROM Messages
    		GROUP BY groupId
    	) sub_msg ON msg.groupId = sub_msg.groupId AND msg.Id = sub_msg.maxId
    ON chat.id = msg.groupId
    LEFT JOIN Users person
    ON msg.senderId = person.id
    `, { type: models.sequelize.QueryTypes.SELECT })
    .then((qres) => {
      const groups = qres.map((group) => {
        const grp = {};
        grp.id = group.id;
        grp.name = group.name;
        grp.description = group.description;
        if (group.message) {
          grp.lastMessage = `${group.firstName} ${group.lastName[0]}: ${group.message}`
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
  models.sequelize.query(`
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
    `, { replacements: [groupId, MAX_MESSAGES], type: models.sequelize.QueryTypes.SELECT })
    .then((qres) => {
      const senderName = (first, last) => {
        return `${first} ${last.charAt(0)}`;
      };
      const sender = { id: req.user.id, name: senderName(req.user.firstName, req.user.lastName) };
      const chatName = qres.name;
      const messageHistory = qres.map((q) => {
        return {
          senderName: senderName(q.firstName, q.lastName),
          body: q.message,
          timeSent: q.timeSent
        };
      });
      // TODO
      const isAdmin = true;
      return res.render('chats/chat', {
        title: chatName,
        tag: 'Chat',
        sender,
        groupId,
        messageHistory,
        isAdmin,
        maxMessages: MAX_MESSAGES
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
    req.flash('errors', errors);
    return res.redirect('/chats');
  }
  models.Group.create({
    name: req.body.name,
    description: req.body.description || '',
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
  const groupId = req.params.id;
  const userEmail = req.body.email;

  req.assert('email', 'Invitee field is not an email.').isEmail();
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/chats/${groupId}`);
  }
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
      return res.redirect('/chats');
    }
    models.User.findOne({
      where: {
        email: userEmail
      }
    }).then((user) => {
      if (!user) {
        req.flash('error', 'No user with that email exists.');
        return res.redirect(`/chats/${groupId}`);
      }
      group.hasUser(user).then((exists) => {
        if (exists) {
          req.flash('error', 'The user you tried to invite is already in the chat.');
          return res.redirect(`/chats/${groupId}`);
        }
        models.Notification.create({
          message: `You have been invited to the chat ${group.name}.`
        }).then((notification) => {
          user.addNotification(notification);
        });
        group.addUser(user);
        req.flash('success', `${user.firstName} has been invited.`);
        return res.redirect(`/chats/${groupId}`);
      });
    });
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
 * delete a chat group.
 */
exports.postDeleteChatGroup = (req, res) => {
  const groupId = req.params.id;
  models.Group.findById(groupId).then((group) => {
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
