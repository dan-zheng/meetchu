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
 * POST/chats/create group
 * create a chat group
 */
exports.postCreateChatGroup = (req, res) => {
  models.Group.create({
    name: req.body.name,
    description: req.body.description, 
    groupType: req.body.groupType
  }).then(() => {
    req.flash('success', 'Success! Your group has been created');
    req.session.save(() => { 
      //redirect to return page. 
      return res.redirect('/');
      });
    });
};


/**
 * POST /chats/delete group
 * delete a chat group. 
 */
/*
exports.postDeleteChatGroup = (req, res) => {
    req.group.destroy().then() => {
      req.flash('sucess', 'Sucess! Your group has been deleted');
      req.session.save(() => {
        //redirect to diff page maybe. 
        return res.redirect('/');
      });
    });
  }); 
};*/ 
