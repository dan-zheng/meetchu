import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import chats from './modules/chats';
import courses from './modules/courses';

Vue.use(Vuex);

export default new Vuex.Store({
  // actions,
  // mutations,
  modules: {
    user,
    chats,
    courses
  },
  strict: process.env.NODE_ENV !== 'production'
});
