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
    console.log(group);
    return res.render('chats/chat', {
      title: group.Title,
      group
    });
  });
};

/**
 * POST /chats/create
 * Create a chat group.
 */
exports.postCreateChatGroup = (req, res) => {
  req.assert('name', 'Group name is empty.').notEmpty();
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
    req.flash('success', 'Success! Your group has been created.');
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
  models.Group.findOne({
    where: {
      id: groupId
    },
    include: [{
      model: models.User
    }]
  }).then((group) => {
    if (!group) {
      return res.redirect('/chats');
    }
    group.removeUser(req.user);
    group = group.dataValues;
    group.Users = group.Users.map((user) => {
      return user.dataValues;
    });
    if (group.Users.length <= 0) {
      group.destroy();
    }
    return res.redirect('/chats');
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
      return res.redirect('/chats');
    }
    group.destroy().then(() => {
      req.flash('success', 'Your group has been deleted.');
      req.session.save(() => {
        return res.redirect('/chats');
      });
    });
  });
};
