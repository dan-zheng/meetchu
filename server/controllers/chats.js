const models = require('../models');
const personDao = require('../dao/person')(models);
const chatDao = require('../dao/chat')(models);
const Either = require('monet').Either;

const MAX_MESSAGES = 10;

/**
 * POST /chats
 * Get a user's chats.
 */
exports.postChats = (req, res) => {
  const person = req.body.user;

  chatDao.getChatList(person).then(result =>
    result.cata(
      err => res.status(401).json(err),
      chatList => res.status(200).json(chatList.toArray())
    )
  );
};

/**
 * POST /chat/users
 * Get a chat's users.
 */
exports.postChatUsers = (req, res) => {
  const chat = req.body.chat;

  chatDao.getChatMessages(chat, MAX_MESSAGES).then(result =>
    result.cata(
      err => res.status(401).json(err),
      chatMessages => res.status(200).json(chatMessages.toArray())
    )
  );
};

/**
 * POST /chats/create
 * Create a chat.
 */
exports.postCreateChat = async (req, res) => {
  const chat = req.body.chat;
  const person = req.body.user;

  const findPerson = await personDao.findById(person.id);
  const createChat = await findPerson.cata(
    err => req.status(401).json(err),
    found => chatDao.create(chat)
  );
  const addPerson = await createChat.cata(
    err => req.status(401).json(err),
    found => chatDao.addPerson(createChat.right(), findPerson.right())
  );
  return createChat.right();
};

/**
 * POST /chats/add
 * Add a user to a chat.
 */
exports.postChatAddUser = (req, res) => {
  const chat = req.body.chat;
  const person = req.body.user;

  chatDao.addPerson(chat, person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(true)
    )
  );
};

/**
 * POST /chats/leave
 * Leave a chat.
 */
exports.postChatRemoveUser = (req, res) => {
  const chat = req.body.chat;
  const person = req.body.user;

  chatDao.removePerson(chat, person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(true)
    )
  );
};

/**
 * POST /chats/delete
 * Delete a chat.
 */
exports.postDeleteChat = (req, res) => {
  const chat = req.body.chat;

  chatDao.erase(chat).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(true)
    )
  );
};
