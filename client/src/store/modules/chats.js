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
      if (!a.time_sent && !b.time_sent) {
        return moment(a.created_at).isBefore(moment(b.created_at)) ? 1 : -1;
      } else if (!a.time_sent) {
        return -1;
      } else if (!b.time_sent) {
        return 1;
      }
      return moment(a.time_sent).isBefore(moment(b.time_sent));
    });
  }
};

const actions = {
  getChats({ commit, rootState }) {
    return Vue.axios.post('/chats', { user: rootState.user.user })
      .then(res => {
        // console.log(res.data);
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
  createChat({ commit, rootState }, { chat }) {
    commit(types.ADD_CHAT, chat);
    return Vue.axios.post('/chats/create', { chat, user: rootState.user.user })
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
  leaveChat({ commit, rootState }, { chat }) {
    commit(types.REMOVE_CHAT, chat);
    return Vue.axios.post(`/chats/remove`, { chat, user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  sendMessage({ commit }, { message }) {
    commit(types.SEND_MESSAGE, message);
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
  [types.REMOVE_CHAT_USER](state, chat, user) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    const users = state.chats[index].users.filter(u => u.id !== user.id);
    Vue.set(state.chats[index], 'users', users);
  },
  [types.SEND_MESSAGE](state, message) {
    const index = state.chats.findIndex(c => c.id === message.chat_id);
    if (!state.chats[index].messages) {
      state.chats[index].messages = [];
    }
    state.chats[index].messages.push(message);
    // TODO: update last_sent, last_sender, last_msg
    Vue.set(state.chats[index], 'time_sent', message.time_sent);
    Vue.set(state.chats[index], 'first_name', message.sender_first_name);
    Vue.set(state.chats[index], 'last_name', message.sender_last_name);
    Vue.set(state.chats[index], 'body', message.body);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
