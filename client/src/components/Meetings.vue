<template lang='pug'>
#content.d-flex
  //-
    #meetings.d-flex.flex-column.col-sm-4.px-0
      .d-flex.text-center.px-4.align-items-stretch
        h2.my-2 Meetings
        span.d-flex.px-0.ml-auto.align-items-center
          a.text-primary.d-flex.align-items-center(@click="$root.$emit('show::modal','add-meeting-modal')")
            i.fa.fa-lg.fa-plus-square
          a.text-primary(@click='clear(["purdueUsername", "purduePassword"]); showModal("#sync-meeting-modal");')
            img(src='static/img/icon-purdue.svg', style='height: 18px')
      #meetings-list
        .list-group
          .list-group-item.list-group-item-action.meeting.rounded-0.border(v-for='meeting in sortedMeetings', :key='meeting.uuid', v-bind:class='{ active: currentMeeting == meeting }', @click='setCurrentMeeting(meeting)')
            .d-flex.w-100.justify-content-between
              h5.mb-1 {{ meeting.subject + ' ' + meeting.number }}
            p.mb-1
              strong {{ meeting.title }}
    #current-meeting.d-flex.flex-column.col-sm-8.px-0(v-model='currentMeeting')
      .page-header
        h2.text-center.my-2 {{ currentMeeting.subject + ' ' + currentMeeting.number }}
      #users-list
        b-list-group
          b-list-group-item.user.rounded-0.border(v-for='user in sortedUsers', :key='user.email')
            | {{ user }}
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import { map as _map, groupBy as _groupBy } from 'lodash';
import { default as swal } from 'sweetalert2';
import { validationStyle } from '../services/form';

const meeting = {
  createdAt: moment().subtract('2', 'days'),
};

console.log(JSON.stringify(meeting, null, 2));

const meetings = Array(1).fill(meeting);

export default {
  name: 'meetings',
  metaInfo: {
    title: 'Meetings'
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
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
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;
}

#meetings-list,
#users-list {
  flex: 1;
}

.meeting {
  border-left: 0;
  border-right: 0;
}
</style>
