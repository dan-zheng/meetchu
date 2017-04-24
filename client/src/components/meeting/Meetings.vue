<template lang='pug'>
#content.d-flex
  #meetings.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Meetings
      span.d-flex.px-0.ml-auto.align-items-center
        //- router-link.text-primary.d-flex.align-items-center(to='/meetings/create')
          i.fa.fa-lg.fa-plus-square
        // a.text-primary.d-flex.align-items-center(@click='resetNewMeeting(); clear(["userHits", "userQuery"]); startNewMeeting();')
        a.text-primary.d-flex.align-items-center(@click='clear(["userHits", "userQuery"]); startNewMeeting();')
          i.fa.fa-lg.fa-plus-square
    #meetings-list
      p.text-muted.px-3.py-2.my-0(v-if='!hasNewMeeting && !hasMeetings') You are not in any meetings.
      .list-group(v-else)
        .list-group-item.list-group-item-action.meeting.rounded-0.border(v-if='hasNewMeeting', :class='{ active: isCurrentMeetingNew }', @click='setCurrentMeeting(newMeeting, true)')
          .d-flex.w-100.justify-content-between.flex-wrap
            h5.mb-1 New Meeting
        .list-group-item.list-group-item-action.meeting.rounded-0.border(v-for='meeting in sortedMeetings', :key='meeting.id', v-bind:class='{ active: currentMeeting == meeting }', @click='setCurrentMeeting(meeting)')
          // p {{ meeting }}
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ meeting.name }}
          p.mb-1
            strong {{ meeting.location }}
  #current-meeting.d-flex.flex-column.col-sm-8.px-0(v-model='currentMeeting')
    #meeting-name.d-flex.text-center.px-4.align-items-stretch(v-if='hasCurrentMeeting')
      span.ml-auto
      h2.my-2(style='min-height: 35px') {{ currentMeeting.name }}
      span.d-flex.px-0.ml-auto.align-items-center
        // a.ml-auto(@click='resetCurrentMeetingNewUsers(); showModal("#meeting-settings-modal");')
        a.ml-auto
          i.fa.fa-lg.fa-cog
    .d-flex.text-center.px-4.align-items-center(v-else)
      h2.mx-auto.my-2(style='min-height: 35px')
        span(v-if='isCurrentMeetingNew') Create a meeting
        span(v-else) Meeting Info
    #users-list
      div(v-if='isCurrentMeetingNew')
    //-
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasMeetings') Create a meeting!
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasCurrentMeeting') Click on a meeting to see meeting information!
      h4.subtitle.px-2.py-2.my-0(v-else) Participants
        span(v-if='hasCurrentMeetingUsers')  ({{ currentMeeting.users.length }})
      .list-group(v-if='hasCurrentMeeting')
        div(v-for='user in currentMeeting.users', :key='user.email')
          router-link.list-group-item.list-group-item-action.user.rounded-0.border(:to='"/profile/" + user.id')
            .d-flex.w-100.mx-1.justify-content-between.align-items-center
              h5.mb-0 {{ user.first_name + ' ' + user.last_name }}
              small.text-right {{ user.email }}

  //- Modals
  .modal.fade#new-meeting-modal(tabindex='-1', role='dialog', aria-labelledby='newMeetingModalLabel', aria-hidden='true')
    .modal-dialog.modal-lg
      .modal-content
        .modal-header
          h5.modal-title Create a meeting
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
          //- Nav tabs
          ul.nav.nav-pills.nav-justified#new-meeting-tabs
            li.nav-item
              a.nav-link.active(href='#new-meeting-modal-dates', role='tab', data-toggle='tab') Pick Dates
            li.nav-item
              a.nav-link(href='#new-meeting-modal-times', role='tab', data-toggle='tab', :class='tabValid[0] ? "" : "disabled"') Pick Times
            li.nav-item
              a.nav-link(href='#new-meeting-modal-users', role='tab', data-toggle='tab', :class='tabValid[1] ? "" : "disabled"') Invite People
          //- Tab content
          .tab-content.mt-3(v-if='hasNewMeeting')
            .tab-pane.active#new-meeting-modal-dates
              .offset-md-1.col-md-10
                //- form.form-inline.justify-content-center.mb-2
                  label.form-check-label.mr-2 Meeting Name
                  input(type='text', v-model='newMeeting.name')
                calendar(title='Dates', ref='calendar-create')
                p.mt-2
                  strong Times:
                  span  You can select more specific times later.
                form.form-inline.justify-content-center
                  .form-check.mb-2.mr-sm-2.mb-sm-0
                    label.form-check-label.mr-2 Morning
                    input(type='checkbox', v-model='timesOfDay.morning', @click='recalculateTimes')
                  .form-check.mb-2.mr-sm-2.mb-sm-0
                    label.form-check-label.mr-2 Afternoon
                    input(type='checkbox', v-model='timesOfDay.afternoon', @click='recalculateTimes')
                  .form-check.mb-2.mr-sm-2.mb-sm-0
                    label.form-check-label.mr-2 Evening
                    input(type='checkbox', v-model='timesOfDay.evening', @click='recalculateTimes')
              .py-2.mt-2.text-center
                button.btn.btn-primary(@click='newMeetingSubmitTab(0)')
                  i.fa.fa-calendar
                  | Select times
            .tab-pane#new-meeting-modal-times
              meeting-time-grid(title='Times', type='create', :days='getSelectedDates()', :times='times', ref='meeting-time-grid-create')
              .py-2.mt-2.text-center
                button.btn.btn-primary(@click='getSelectedDatetimes(); newMeetingSubmitTab(1)')
                  i.fa.fa-user-plus
                  | Invite users
            .tab-pane#new-meeting-modal-users
              #new-meeting-input.d-flex.align-items-center
                span.mx-2 To:
                input#user-search-input.px-2(v-model='userQuery', placeholder='Search for users...', @keyup='search("userHits", userQuery, newMeeting)')

              .card.m-3.p-2
                small(v-if='userQuery.length === 0') Enter a query. You can search by user first name, last name, or email.
                small.text-info(v-else-if='userHits.length > 0') Matches
                small.text-warning(v-else-if='userQuery.length > 0 && typeof newMeeting !== "undefined"') No matches.
                .list-group
                  .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedHitUsers', :key='user.objectId', @click='addUserToNewMeeting(user, index)')
                    .d-flex.w-100.mx-1.justify-content-between.align-items-center
                      h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                      small.text-right(style='min-width: 80px;') {{ user.email }}
                small.text-success(v-if='newMeeting.users.length > 0') Selected
                .list-group
                  .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedNewMeetingUsers', :key='user.id', @click='removeUserFromNewMeeting(user, index)')
                    .d-flex.w-100.mx-1.justify-content-between.align-items-center
                      i.fa.fa-check.text-success
                      h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                      small.text-right(style='min-width: 80px;') {{ user.email }}
                .py-2.mt-2.text-center
                  button.btn.btn-primary(@click='newMeetingSubmitTab(2)')
                    i.fa.fa-calendar-plus-o
                    | Create meeting
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import mergeRanges from 'merge-ranges';
import createIntervalTree from 'interval-tree-1d';
import { map as _map, groupBy as _groupBy, range as _range } from 'lodash';
import { default as swal } from 'sweetalert2';
import { userIndex } from '../../common/algolia';
import { validationStyle } from '../../common/form';

import Calendar from '../fragments/Calendar';
import MeetingTimeGrid from '../fragments/MeetingTimeGrid';

const timesLegend = {
  morning: _range(8, 11, 1),
  afternoon: _range(12, 16, 1),
  evening: _range(17, 21, 1)
};

export default {
  name: 'meetings',
  metaInfo: {
    title: 'Meetings'
  },
  components: {
    'calendar': Calendar,
    'meeting-time-grid': MeetingTimeGrid
  },
  data() {
    return {
      tabIndex: 0,
      tabValid: [false, false, false],
      timesOfDay: {},
      times: [],
      newMeeting: null,
      currentMeeting: null,
      isCurrentMeetingNew: false,
      userQuery: '',
      userHits: []
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      meetings: 'meetings',
      sortedMeetings: 'sortedMeetings',
      sortedFinalizedMeetings: 'sortedFinalizedMeetings'
    }),
    sortedHitUsers() {
      return this.userHits.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    sortedNewMeetingUsers() {
      const temp = this.newMeeting.users;
      return temp.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    sortedCurrentMeetingUsers() {
      const temp = this.currentMeeting.users;
      return temp.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    hasMeetings() {
      return this.meetings.length > 0;
    },
    hasNewMeeting() {
      return typeof this.newMeeting !== 'undefined' && this.newMeeting !== null;
    },
    hasCurrentMeeting() {
      return typeof this.currentMeeting !== 'undefined' && !!this.currentMeeting && this.currentMeeting.name !== '';
    },
    hasCurrentMeetingUsers() {
      return typeof this.currentMeeting.users !== 'undefined' && this.currentMeeting.users.length > 1;
    }
  },
  created() {
    this.resetNewMeeting();
  },
  methods: {
    newMeetingSubmitTab(tabIndex) {
      if (tabIndex === 0) {
        if (this.getSelectedDates().length === 0 || this.times.length === 0) {
          this.tabValid[tabIndex] = false;
          swal({
            type: 'error',
            title: 'Oops.',
            text: 'Please select some dates and at least one time of day for your meeting.'
          })
          .catch(swal.noop);
          return;
        }
      } else if (tabIndex === 1) {
        if (this.getSelectedDatetimes().length === 0) {
          this.tabValid[tabIndex] = false;
          swal({
            type: 'error',
            title: 'Oops.',
            text: 'Please select some times for your meeting.'
          })
          .catch(swal.noop);
          return;
        }
      } else if (tabIndex === 2) {
        this.getIntervalTree();
      }
      // Set tab to be valid and go to next tab, or next option
      this.$set(this.tabValid, tabIndex, true);
      $(`#new-meeting-tabs li:eq(${tabIndex + 1}) a`).removeClass('disabled');
      if (tabIndex < 2) {
        $(`#new-meeting-tabs li:eq(${tabIndex + 1}) a`).tab('show');
        return;
      } else {
        console.log('Create meeting');
        this.createMeeting();
        this.hideModal('#new-meeting-modal');
        this.resetNewMeeting();
      }
    },
    recalculateTimes() {
      let times = [];
      Object.keys(this.timesOfDay).forEach((key) => {
        if (this.timesOfDay[key]) {
          times = times.concat(timesLegend[key]);
        }
      });
      const temp = moment();
      times = times.reduce((acc, time) => {
        const t1 = moment(temp).hour(time).minute(0);
        const t2 = moment(t1).minute(30);
        acc = acc.concat([t1, t2]);
        return acc;
      }, []);
      this.times = times;
    },
    startNewMeeting() {
      this.setCurrentMeetingToNew();
      if (!this.newMeeting || !this.newMeeting.users) {
        this.newMeeting = {
          name: 'New Meeting',
          users: [],
          time: []
        };
      }
      // Show create meeting modal
      this.showModal('#new-meeting-modal');
    },
    setCurrentMeeting(meeting, isNewMeeting) {
      this.currentMeeting = meeting;
      if (isNewMeeting) {
        this.setCurrentMeetingToNew();
        return;
      }
      this.isCurrentMeetingNew = false;
      this.$store.dispatch('getMeetingUsers', { meeting: this.currentMeeting });
    },
    setCurrentMeetingToNew() {
      this.currentMeeting = this.newMeeting;
      this.isCurrentMeetingNew = true;
    },
    resetNewMeeting() {
      // Old
      this.newMeeting = null;
      this.isCurrentMeetingNew = false;
      // New
      this.tabIndex = 0;
      this.tabValid = [false, false, false];
      this.timesOfDay = {
        morning: false,
        afternoon: false,
        evening: false
      };
      this.timeRanges = null;
    },
    createMeeting() {
      this.newMeeting.name = [this.user.first_name].concat(this.newMeeting.users.map(u => u.first_name)).join(', ');
      this.newMeeting.time = JSON.stringify(this.newMeeting.time);
      this.$store.dispatch('createMeeting', {
        meeting: this.newMeeting,
        users: this.newMeeting.users
      }).then(() => {
        swal({
          type: 'success',
          title: 'Woohoo!',
          text: 'Your meeting has been created!'
        })
        .catch(swal.noop);
      }).catch((e) => {
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data
        })
        .catch(swal.noop);
      });
    },
    addUserToNewMeeting(user, index) {
      this.userHits.splice(index, 1);
      this.newMeeting.users.push(user);
    },
    removeUserFromNewMeeting(user, index) {
      this.newMeeting.users.splice(index, 1);
      this.search("userHits", this.userQuery, this.newMeeting);
    },
    resetCurrentMeeting(isNewMeeting) {
      if (!isNewMeeting && this.sortedMeetings.length > 0) {
        this.currentMeeting = this.sortedMeetings[0];
        this.isCurrentMeetingNew = false;
      } else {
        this.currentMeeting = null;
      }
    },
    getSelectedDates() {
      if (!this.$refs['calendar-create']) {
        return [];
      }
      return this.$refs['calendar-create'].selectedDays;
    },
    getSelectedDatetimes() {
      if (!this.$refs['meeting-time-grid-create']) {
        return [];
      }
      return this.$refs['meeting-time-grid-create'].selectedDatetimes;
    },
    getIntervalTree() {
      const datetimes = this.getSelectedDatetimes();
      const intervals = datetimes.reduce((acc, dt) => {
        const start = dt.unix();
        const end = moment(dt).add(30, 'minutes').unix();
        return acc.concat([[start, end]]);
      }, []);
      const tree = createIntervalTree(intervals);
      this.newMeeting.time = mergeRanges(tree.intervals);
    },
    search(hits, query, meeting) {
      if (!query) {
        this[hits] = [];
        return false;
      }
      userIndex.search(query, {
        hitsPerPage: 5
      }, (error, results) => {
        const filteredHits = results.hits.filter(el => this.user.id != el.objectID && !meeting.users.some(u => u.id === el.objectID));
        filteredHits.forEach((el) => {
          el.id = el.objectID;
          delete el.objectID;
          delete el._highlightResult;
          return el;
        });
        this[hits] = filteredHits;
      });
    },
    clear(values) {
      values.forEach((v) => {
        const temp = this[v];
        if (Array.isArray(temp)) {
          this[v] = [];
        } else if (typeof temp === 'string' || temp instanceof String) {
          this[v] = '';
        }
      });
    },
    showTab(tabId) {
      $(tabId).tab('show');
    },
    hideTab(tabId) {
      $(tabId).tab('hide');
    },
    showModal(modalId) {
      $(modalId).modal('show');
    },
    hideModal(modalId) {
      $(modalId).modal('hide');
    },
    validationStyle
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

#content {
  flex: 1;
}

.list-group-item {
  flex: 1;
  &:first-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  &:last-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.nav-link.active {
  background-color: $brand-primary !important;
}

#current-meeting {
  border-left: 1px solid $grid-border-color;
}

#meetings-list,
#users-list {
  flex: 1;
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;
}

#new-meeting-input {
  border: none;
  border: 1px solid $grid-border-color;
  width: 100%;
  height: 40px;

  #user-search-input {
    border: none;
    height: 100%;
    padding-top: 2px;
    flex: 1;
  }
}

.meeting {
  border-left: 0;
  border-right: 0;
}
</style>
