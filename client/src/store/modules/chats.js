import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  chats: []
};

const getters = {
  chats: state => state.chats
};

const actions = {
  initChats({ commit, rootState }) {
    return Vue.axios.post('/chats', { userId: rootState.user.id })
      .then(res => commit(types.SET_CHATS, res.data))
      .catch((err) => {
        throw err;
      });
  },
  createChat({ commit, rootState }, { chat }) {
    return Vue.axios.post('/chats/create', { chat, userId: rootState.user.id })
      .then(res => commit(types.ADD_CHAT, res.data))
      .catch((err) => {
        throw err;
      });
  },
  removeChat({ commit, rootState }, { chat }) {
    return Vue.axios.post(`/chats/${chat.id}/remove`, { userId: rootState.user.id })
      .then(res => commit(types.REMOVE_CHAT, chat))
      .catch((err) => {
        throw err;
      });
  },
  deleteChat({ commit, rootState }, { chat }) {
    return Vue.axios.post(`/chats/${chat.id}/delete`, { userId: rootState.user.id })
      .then(res => commit(types.REMOVE_CHAT, chat))
      .catch((err) => {
        throw err;
      });
  }
};

const mutations = {
  [types.SET_CHATS](state, chats) {
    state.chats = chats;
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
