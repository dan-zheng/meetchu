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
        // NOTE: A user is given admin status based on
        // whether or not they are first in group.Users.
        // This may not work as intended.
        const isAdmin = group.Users[0].id === req.user.id;
        return res.render('chats/chat', {
            title: group.name,
            tag: 'Chat',
            group,
            isAdmin
        });
  }).catch((err) => {
    req.flash('info', 'Chat does not exist.');
    req.session.save(() => {
      return res.redirect(req.session.returnTo);
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
