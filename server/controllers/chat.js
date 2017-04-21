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

  chatDao.getPeopleByChat(chat).then(result =>
    result.cata(
      err => res.status(401).json(err),
      people => res.status(200).json(people.toArray())
    )
  );
};

/**
 * POST /chat/messages
 * Get a chat's messages.
 */
exports.postChatMessages = (req, res) => {
  const chat = req.body.chat;

  chatDao.getChatMessages(chat, MAX_MESSAGES).then(result =>
    result.cata(
      err => res.status(401).json(err),
      messages => res.status(200).json(messages.toArray())
    )
  );
};

/**
 * POST /chats/create
 * Create a chat.
 */
exports.postCreateChat = async (req, res) => {
  const chat = req.body.chat;
  const people = req.body.users ? req.body.users : [req.body.user];

  const createChat = await chatDao.create(chat);
  const addPeople = await createChat.flatMap(
    found => chatDao.addPeople(createChat.right(), people)
  );
  addPeople.cata(
    err => res.status(401).json(err),
    affectedRows => res.status(200).json(createChat.right())
  );
};

/**
 * POST /chats/add
 * Add a user to a chat.
 */
exports.postChatAddUser = (req, res) => {
  const chat = req.body.chat;
  const people = req.body.users ? req.body.users : [req.body.user];

  chatDao.addPeople(chat, people).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      affectedRows => res.status(200).json(true)
    )
  );
};

/**
 * POST /chats/remove
 * Remove a user from a chat.
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
 * POST /chats/send
 * Leave a chat.
 */
exports.postChatSendMessage = (req, res) => {
  const message = req.body.message;

  chatDao.addMessage(message).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      msg => res.status(200).json(msg)
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
