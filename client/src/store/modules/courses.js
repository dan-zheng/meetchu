import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  courses: []
};

const getters = {
  courses: state => state.courses,
  sortedCourses: state => {
    return state.courses.sort((a, b) => {
      return a.courseID.localeCompare(b.courseID);
    });
  }
};

const actions = {
  getCourses({ commit, rootState }) {
    return Vue.axios.post('/courses', { user: rootState.user.user })
      .then(res => commit(types.SET_COURSES, res.data))
      .catch((err) => {
        throw err;
      });
  },
  getCourseUsers({ commit }, { course }) {
    return Vue.axios.post('/courses/users', { course })
      .then(res => commit(types.SET_COURSE_USERS, course, res.data))
      .catch((err) => {
        throw err;
      });
  },
  addCourse({ commit, rootState }, { course }) {
    return Vue.axios.post('/courses/add', { course, user: rootState.user.user })
      .then(res => commit(types.ADD_COURSE, res.data))
      .catch((err) => {
        throw err;
      });
  },
  removeCourse({ commit, rootState }, { course }) {
    return Vue.axios.post(`/courses/remove`, { course, user: rootState.user.user })
      .then(res => commit(types.REMOVE_COURSE, course))
      .catch((err) => {
        throw err;
      });
  },
  syncCourses({ commit, rootState }, { username, password }) {
    return Vue.axios.post(`/courses/sync`, {
      user: rootState.user.user,
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
  [types.SET_COURSE_USERS](state, course, users) {
    let index = -1;
    state.courses.forEach((c, i) => {
      if (c.id === course.id) {
        index = i;
        state.courses[i] = users;
      }
    });
    return state.courses[index];
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
