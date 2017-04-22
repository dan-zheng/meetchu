import Vue from 'vue';
import * as types from '../mutation-types';
import * as moment from 'moment';

const state = {
  chats: []
};

const getters = {
  chats: state => state.chats,
  sortedChats: state => {
    const temp = state.chats.slice(0);
    return temp.sort((a, b) => {
      if (!a.last_time_sent && !b.last_time_sent) {
        return moment(a.created_at).isBefore(moment(b.created_at)) ? 1 : -1;
      } else if (!a.last_time_sent) {
        return -1;
      } else if (!b.last_time_sent) {
        return 1;
      }
      return moment(a.last_time_sent).isBefore(moment(b.last_time_sent));
    });
  }
};

const actions = {
  getChats({ commit, rootState }) {
    return Vue.axios.post('/chats', { user: rootState.user.user })
      .then(res => {
        return commit(types.SET_CHATS, res.data);
      })
      .catch((err) => {
        throw err;
      });
  },
  getChatUsers({ commit }, { chat }) {
    return Vue.axios.post('/chat/users', { chat })
      .then(res => commit(types.SET_CHAT_USERS, { chat, users: res.data }))
      .catch((err) => {
        throw err;
      });
  },
  getChatMessages({ commit }, { chat }) {
    return Vue.axios.post('/chat/messages', { chat })
      .then(res => commit(types.SET_CHAT_MESSAGES, { chat, messages: res.data }))
      .catch((err) => {
        throw err;
      });
  },
  addChat({ commit, rootState }, { chat }) {
    commit(types.ADD_CHAT, chat);
  },
  createChat({ commit, rootState }, { chat, users }) {
    return Vue.axios.post('/chats/create', { chat, users })
      .then((res) => {
        commit(types.ADD_CHAT, res.data);
        return res.data;
      })
      .catch((err) => {
        throw err;
      });
  },
  removeChat({ commit, rootState }, { chat }) {
    commit(types.REMOVE_CHAT, chat);
    return Vue.axios.post(`/chats/remove`, { chat, user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  addChatUser({ commit }, { chat, user }) {
    commit(types.ADD_CHAT_USER, chat, user);
    return Vue.axios.post(`/chats/add`, { chat, user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  removeChatUser({ commit }, { chat, user }) {
    commit(types.REMOVE_CHAT_USER, chat, user);
    return Vue.axios.post(`/chats/remove`, { chat, user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  addMessage({ commit }, { message }) {
    message = Object.assign({}, message, { new: true });
    commit(types.ADD_MESSAGE, {
      message
    });
  },
  sendMessage({ commit }, { message }) {
    message = Object.assign({}, message, { new: true });
    commit(types.ADD_MESSAGE, {
      message
    });
    return Vue.axios.post(`/chats/send`, { message })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  deleteChat({ commit }, { chat }) {
    commit(types.REMOVE_CHAT, chat);
    return Vue.axios.post(`/chats/delete`, { chat })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  }
};

const mutations = {
  [types.SET_CHATS](state, chats) {
    state.chats = chats;
  },
  [types.SET_CHAT_USERS](state, { chat, users }) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    Vue.set(state.chats[index], 'users', users);
  },
  [types.SET_CHAT_MESSAGES](state, { chat, messages }) {
    const lastMessage = messages[0];
    const index = state.chats.findIndex(c => c.id === chat.id);
    Vue.set(state.chats[index], 'messages', messages);
  },
  [types.ADD_CHAT](state, chat) {
    state.chats.push(chat);
  },
  [types.REMOVE_CHAT](state, chat) {
    state.chats = state.chats.filter(c => c.id !== chat.id);
  },
  [types.ADD_CHAT_USER](state, chat, user) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    state.chats[index].users.push(user);
  },
  [types.ADD_CHAT_USERS](state, chat, users) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    state.chats[index].users.concat(users);
  },
  [types.REMOVE_CHAT_USER](state, chat, user) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    const users = state.chats[index].users.filter(u => u.id !== user.id);
    Vue.set(state.chats[index], 'users', users);
  },
  [types.ADD_MESSAGE](state, { message }) {
    const index = state.chats.findIndex(c => c.id === message.chat_id);
    if (index === -1) {
      return;
    }
    const displayedMessage = {
      id: message.chat_id,
      sender_id: message.sender_id,
      sender_first_name: message.sender_first_name,
      sender_last_name: message.sender_last_name,
      body: message.body,
      time_sent: message.time_sent,
      new: message.new
    };
    if (!state.chats[index].messages) {
      state.chats[index].messages = [];
    }
    state.chats[index].messages.push(displayedMessage);
    Vue.set(state.chats[index], 'sender_first_name', message.sender_first_name);
    Vue.set(state.chats[index], 'sender_last_name', message.sender_last_name);
    Vue.set(state.chats[index], 'last_message_body', message.body);
    Vue.set(state.chats[index], 'last_time_sent', message.time_sent);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
