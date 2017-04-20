import Vue from 'vue';
import * as types from '../mutation-types';

const state = {
  courses: []
};

const getters = {
  courses: state => state.courses,
  sortedCourses: state => {
    const temp = state.courses.slice(0);
    return temp.sort((a, b) => {
      const _a = a.subject + ' ' + a.number;
      const _b = b.subject + ' ' + b.number;
      return _a.localeCompare(_b);
    });
  }
};

const actions = {
  getCourses({ commit, rootState }) {
    return Vue.axios.post('/courses', { user: rootState.user.user })
      .then(res => {
        commit(types.SET_COURSES, res.data);
      })
      .catch((err) => {
        throw err;
      });
  },
  getCourseUsers({ commit }, { course }) {
    return Vue.axios.post('/course/users', { course })
      .then(res => commit(types.SET_COURSE_USERS, { course, users: res.data }))
      .catch((err) => {
        throw err;
      });
  },
  addCourse({ commit, rootState }, { course }) {
    commit(types.ADD_COURSE, course);
    return Vue.axios.post('/course/add', { course, user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  removeCourse({ commit, rootState }, { course }) {
    commit(types.REMOVE_COURSE, course);
    return Vue.axios.post(`/course/remove`, { course, user: rootState.user.user })
      .then(res => true)
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
  [types.SET_COURSE_USERS](state, { course, users }) {
    state.courses.forEach((c, i) => {
      if (c.id === course.id) {
        Vue.set(state.courses[i], 'users', users);
      }
    });
  },
  [types.ADD_COURSE](state, course) {
    state.courses.push(course);
  },
  [types.REMOVE_COURSE](state, course) {
    state.courses = state.courses.filter(c => c.id !== course.id);
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
