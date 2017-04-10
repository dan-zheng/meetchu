import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)
// axios.defaults.baseURL = 'localhost:3000';

const state = {
  user: null
}

const mutations = {
  SET_USER (state, user) {
    state.user = user
  }
}

const actions = {
  nuxtServerInit ({ commit }, { req }) {
    if (req.session && req.session.user) {
      commit('SET_USER', req.session.user)
    }
  },
  login ({ commit }, { username, password }) {
    return axios.post('/api/login', {
      username,
      password
    })
    .then((res) => {
      commit('SET_USER', res.data)
    })
    .catch((error) => {
      if (error.response.status === 401) {
        throw new Error('Bad credentials')
      }
    })
  },
  logout ({ commit }) {
    return axios.post('/api/logout')
    .then(() => {
      commit('SET_USER', null)
    })
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
