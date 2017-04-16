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
  loginAuth({ commit }, { provider }) {
    // TODO: Needs to be rewritten
    // window.location.href = `http://localhost:3000/auth/${provider}`
    return Vue.axios.get(`/auth/${provider}`)
    .then((res) => {
      commit(types.SET_USER, res.data);
    })
    .catch((err) => {
      throw err;
    });
  },
  signup({ commit }, { firstName, lastName, email, password, confirmPassword }) {
    return Vue.axios.post('/signup', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    })
    .then((res) => {
      commit(types.SET_USER, res.data);
      // console.log(state.user);
    })
    .catch((err) => {
      // console.log(JSON.stringify(err, null, 2));
      throw err;
    });
  },
  login({ commit }, { email, password }) {
    return Vue.axios.post('/login', {
      email,
      password
    })
    .then((res) => {
      commit(types.SET_USER, res.data);
      // console.log(state.user);
    })
    .catch((err) => {
      // console.log(JSON.stringify(err, null, 2));
      throw err;
    });
  },
  logout({ commit }) {
    return Vue.axios.get('/logout')
    .then(() => {
      commit(types.UNSET_USER, null);
    })
    .catch((err) => {
      // console.log(JSON.stringify(err, null, 2));
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
  [types.UNSET_USER](state, user) {
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
