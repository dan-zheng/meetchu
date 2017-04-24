import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  user: null
};

const getters = {
  user: state => state.user,
  isLoggedIn: state => state.user !== null
};

const actions = {
  checkAuth({ commit }) {
    commit(types.GET_USER);
  },
  /*
  checkAuth() {
    const user = localStorage.getItem('user');
    return !!user;
  },
  */
  loggedIn() {
    return !!state.user;
  },
  loginOauth({ commit }, { provider }) {
    // TODO: Needs to be rewritten
    // window.location.href = `http://localhost:3000/auth/${provider}`
    return Vue.axios.get(`/auth/${provider}`)
      .then(res => commit(types.SET_USER, res.data))
      .catch((err) => {
        throw err;
      });
  },
  signup({ commit }, { first_name, last_name, email, password, confirm_password }) {
    return Vue.axios.post('/signup', {
      first_name,
      last_name,
      email,
      password,
      confirm_password
    })
    .then((res) => {
      commit(types.SET_USER, res.data);
    })
    .catch((err) => {
      throw err;
    });
  },
  login({ commit }, { email, password }) {
    return Vue.axios.post('/login', { email, password })
      .then(res => commit(types.SET_USER, res.data))
      .catch((err) => {
        throw err;
      });
  },
  logout({ commit }) {
    return Vue.axios.get('/logout')
      .then(res => commit(types.UNSET_USER))
      .catch((err) => {
        throw err;
      });
  },
  updateAccount({ commit }, { user, fields }) {
    return Vue.axios.post('/account/update', { user, fields })
      .then(res => commit(types.SET_USER, res.data))
      .catch((err) => {
        throw err;
      });
  },
  deleteAccount({ commit }, { user }) {
    // TODO: back-end controller for deleting account
    return Vue.axios.post('/account/delete', { user })
      .then(res => commit(types.UNSET_USER))
      .catch((err) => {
        throw err;
      });
  }
};

const mutations = {
  [types.GET_USER](state) {
    const temp = localStorage.getItem('user');
    if (temp) {
      state.user = JSON.parse(temp);
    }
  },
  [types.SET_USER](state, user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  },
  [types.UNSET_USER](state) {
    state.user = null;
    localStorage.removeItem('user');
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
