import Vue from 'vue'
import * as types from '../mutation-types'

const state = {
  user: null
}

const getters = {
  user: state => state.user,
  isLoggedIn: state => state.user !== null
}

const actions = {
  checkAuth () {
    return
  },
  login ({ commit }, { email, password }) {
    return Vue.axios.post('/login', {
      email,
      password
    })
    .then((res) => {
      console.log('login success');
      console.log(res);
      commit(types.SET_USER, res.data)
      console.log(state.user);
    })
    .catch((error) => {
      console.log('login error');
      console.log(error);
      /*
      if (error.response.status === 401) {
        throw new Error('Bad credentials')
      }
      */
    })
  },
  logout ({ commit }) {
    return Vue.axios.post('/logout')
    .then(() => {
      commit(types.SET_USER, null)
    })
  }
}

const mutations = {
  [types.SET_USER] (state, user) {
    state.user = user
    localStorage.setItem('user', user)
  },
  [types.UNSET_USER] (state, user) {
    state.user = null
    localStorage.deleteItem('user')
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
