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
