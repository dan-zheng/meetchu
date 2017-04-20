import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  chats: []
};

const getters = {
  chats: state => state.chats,
  sortedChats: state => {
    const temp = state.chats.slice(0);
    return temp.sort((a, b) => {
      if (!a.time_last_sent) {
        return 1;
      } else if (!b.time_last_sent) {
        return -1;
      }
      return b.time_last_sent.isAfter(a.time_last_sent);
    });
  }
};

const actions = {
  getChats({ commit, rootState }) {
    return Vue.axios.post('/chats', { user: rootState.user.user })
      .then(res => commit(types.SET_CHATS, res.data))
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
  createChat({ commit, rootState }, { chat }) {
    commit(types.ADD_CHAT, res.data);
    return Vue.axios.post('/chats/create', { chat, user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  removeChat({ commit, rootState }, { chat }) {
    commit(types.REMOVE_CHAT, chat);
    return Vue.axios.post(`/chats/${chat.id}/remove`, { user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  deleteChat({ commit, rootState }, { chat }) {
    commit(types.REMOVE_CHAT, chat);
    return Vue.axios.post(`/chats/${chat.id}/delete`, { user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  }
};

const mutations = {
  [types.SET_CHATS](state, chats) {
    console.log(chats);
    state.chats = chats;
  },
  [types.SET_CHAT_USERS](state, { chat, users }) {
    state.chats.forEach((c, i) => {
      if (c.id === chat.id) {
        Vue.set(state.chats[i], 'users', users);
      }
    });
  },
  [types.ADD_CHAT](state, chat) {
    state.chats.push(chat);
  },
  [types.REMOVE_CHAT](state, chat) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    state.chats.splice(index, 1);
  },
  [types.SEND_MESSAGE](state, chat, message) {
    const index = state.chats.findIndex(c => c.id === chat.id);
    state.chats[index].messages.push(message);
  },
  [types.UNSET_USER](state) {
    state.chats = [];
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
