<template lang='pug'>
div#test
  .offset-md-1.col-md-10
    // calendar
    meeting-time-grid(:days='days', :times='times')
</template>

<script>
import { mapGetters } from 'vuex';
import { chunk as _chunk, map as _map, range as _range, zipObject as _zipObject } from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

import Calendar from './fragments/Calendar';
import MeetingTimeGrid from './fragments/MeetingTimeGrid';

const moment = extendMoment(Moment);

export default {
  name: 'test',
  props: ['title'],
  components: {
    'calendar': Calendar,
    'meeting-time-grid': MeetingTimeGrid
  },
  created() {
    // Set up days
    const now = moment();
    const start = moment(now).startOf('day');
    const end = moment(start).add(20, 'days');
    const range = moment.range(start, end);
    this.days = Array.from(range.by('day'));

    // Set up times
    const temp = moment().set('minute', 0);
    const hoursRange = _range(8, 14, 1);
    let times = [];
    hoursRange.forEach((h) => {
      const t1 = moment(temp).set('hour', h);
      times.push(t1);
      const t2 = moment(t1).set('minute', 30);
      times.push(t2);
    });
    this.times = times;
  },
  data() {
    return {
      days: null,
      times: null
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';
#test {
  width: 100%;
}
</style>
