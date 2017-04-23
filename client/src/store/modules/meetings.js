import Vue from 'vue';
import * as types from '../mutation-types';
import * as moment from 'moment';

const state = {
  meetings: []
};

const getters = {
  meetings: state => state.meetings,
  sortedMeetings: state => {
    const temp = state.meetings.slice(0);
    return temp.sort((a, b) => {
      if (!a.last_updated) {
        return -1;
      } else if (!b.last_updated) {
        return 1;
      }
      return moment(a.last_updated).isBefore(moment(b.last_updated));
    });
  },
  sortedFinalizedMeetings: state => {
    const temp = state.meetings.slice(0);
    return temp
      .filter(m => m.final_time !== null)
      .sort((a, b) => {
        return moment(a.final_time).isBefore(moment(b.final_time));
      });
  }
};

const actions = {
  getMeetings({ commit, rootState }) {
    return Vue.axios.post('/meetings', { user: rootState.user.user })
      .then(res => {
        return commit(types.SET_MEETINGS, res.data);
      })
      .catch((err) => {
        throw err;
      });
  },
  getMeetingUsers({ commit }, { meeting }) {
    return Vue.axios.post('/meeting/users', { meeting })
      .then(res => commit(types.SET_MEETING_USERS, { meeting, users: res.data }))
      .catch((err) => {
        throw err;
      });
  },
  getMeetingTimes({ commit }, { meeting }) {
    return Vue.axios.post('/meeting/messages', { meeting })
      .then(res => commit(types.SET_MEETING_TIMES, { meeting, messages: res.data }))
      .catch((err) => {
        throw err;
      });
  },
  addMeeting({ commit, rootState }, { meeting }) {
    commit(types.ADD_MEETING, meeting);
  },
  createMeeting({ commit, rootState }, { meeting, users }) {
    return Vue.axios.post('/meetings/create', { meeting, users })
      .then((res) => {
        commit(types.ADD_MEETING, res.data);
        return res.data;
      })
      .catch((err) => {
        throw err;
      });
  },
  removeMeeting({ commit, rootState }, { meeting }) {
    commit(types.REMOVE_MEETING, meeting);
    return Vue.axios.post(`/meetings/remove`, { meeting, user: rootState.user.user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  addMeetingUsers({ commit }, { meeting, users }) {
    commit(types.ADD_MEETING_USERS, { meeting, users });
    return Vue.axios.post(`/meetings/add`, { meeting, users })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  removeMeetingUser({ commit }, { meeting, user }) {
    commit(types.REMOVE_MEETING_USER, meeting, user);
    return Vue.axios.post(`/meetings/remove`, { meeting, user })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  },
  deleteMeeting({ commit }, { meeting }) {
    commit(types.REMOVE_MEETING, meeting);
    return Vue.axios.post(`/meetings/delete`, { meeting })
      .then(res => true)
      .catch((err) => {
        throw err;
      });
  }
};

const mutations = {
  [types.SET_MEETINGS](state, meetings) {
    state.meetings = meetings;
  },
  [types.SET_MEETING_USERS](state, { meeting, users }) {
    const index = state.meetings.findIndex(m => m.id === meeting.id);
    Vue.set(state.meetings[index], 'users', users);
  },
  [types.ADD_MEETING](state, meeting) {
    state.meetings.push(meeting);
  },
  [types.REMOVE_MEETING](state, meeting) {
    state.meetings = state.meetings.filter(m => m.id !== meeting.id);
  },
  [types.ADD_MEETING_USERS](state, { meeting, users }) {
    const index = state.meetings.findIndex(m => m.id === meeting.id);
    state.meetings[index].users = state.meetings[index].users.concat(users);
  },
  [types.REMOVE_MEETING_USER](state, meeting, user) {
    const index = state.meetings.findIndex(m => m.id === meeting.id);
    const users = state.meetings[index].users.filter(u => u.id !== user.id);
    Vue.set(state.meetings[index], 'users', users);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
