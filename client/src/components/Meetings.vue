<template lang='pug'>
#content.d-flex
  #meetings.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Meetings
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary.d-flex.align-items-center(@click='resetNewMeeting(); clear(["userHits", "userQuery"]); startNewMeeting();')
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
          .py-2.text-center
            button.btn.btn-primary(@click='createMeeting(newMeeting)')
              i.fa.fa-plus-circle
              | Create meeting

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
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import { map as _map, groupBy as _groupBy } from 'lodash';
import { default as swal } from 'sweetalert2';
import { userIndex } from '../common/algolia';
import { validationStyle } from '../common/form';

const meeting = {
  createdAt: moment().subtract('2', 'days'),
};

// console.log(JSON.stringify(meeting, null, 2));

const meetings = Array(1).fill(meeting);

export default {
  name: 'meetings',
  metaInfo: {
    title: 'Meetings'
  },
  data() {
    return {
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
  methods: {
    startNewMeeting() {
      this.setCurrentMeetingToNew();
      if (!this.newMeeting || !this.newMeeting.users) {
        this.newMeeting = {
          name: 'New Meeting',
          users: []
        };
      }
    },
    setCurrentMeeting(meeting, isNewMeeting) {
      this.currentMeeting = meeting;
      if (isNewMeeting) {
        this.setCurrentMeetingToNew();
        return;
      }
      this.isCurrentMeetingNew = false;
      this.$store.dispatch('getMeetingUsers', { meeting: this.currentMeeting });
      this.$store.dispatch('getMeetingMessages', { meeting: this.currentMeeting });
    },
    setCurrentMeetingToNew() {
      this.currentMeeting = this.newMeeting;
      this.isCurrentMeetingNew = true;
    },
    resetNewMeeting() {
      this.newMeeting = null;
      this.isCurrentMeetingNew = false;
    },
    resetCurrentMeeting(isNewMeeting) {
      if (!isNewMeeting && this.sortedMeetings.length > 0) {
        this.currentMeeting = this.sortedMeetings[0];
        this.isCurrentMeetingNew = false;
      } else {
        this.currentMeeting = null;
      }
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
  border-bottom: 1px solid $grid-border-color;
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
