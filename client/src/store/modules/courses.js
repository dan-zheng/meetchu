import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  courses: []
};

const getters = {
  courses: state => state.courses
};

const actions = {
  initCourses({ commit, rootState }) {
    return Vue.axios.post('/courses', { userId: rootState.user.id })
      .then(res => commit(types.SET_COURSES, res.data))
      .catch((err) => {
        throw err;
      });
  },
  addCourse({ commit, rootState }, { course }) {
    return Vue.axios.post('/courses/add', { course, userId: rootState.user.id })
      .then(res => commit(types.ADD_COURSE, res.data))
      .catch((err) => {
        throw err;
      });
  },
  removeCourse({ commit, rootState }, { course }) {
    return Vue.axios.post(`/courses/${course.id}/remove`, { userId: rootState.user.id })
      .then(res => commit(types.REMOVE_COURSE, course))
      .catch((err) => {
        throw err;
      });
  },
  syncCourses({ commit, rootState }, { username, password }) {
    return Vue.axios.post(`/courses/sync`, {
      userId: rootState.user.id,
      username,
      password
    })
    // Assume that controller will return all courses
    .then(res => commit(types.SET_COURSES, res.data))
    .catch((err) => {
      throw err;
    });
  },
};

const mutations = {
  [types.SET_COURSES](state, courses) {
    state.courses = courses;
  },
  [types.ADD_COURSE](state, course) {
    state.courses.push(course);
  },
  [types.REMOVE_COURSE](state, course) {
    const index = state.courses.findIndex(c => c.id === course.id);
    state.courses.splice(index, 1);
  },
  [types.UNSET_USER](state) {
    state.courses = [];
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
