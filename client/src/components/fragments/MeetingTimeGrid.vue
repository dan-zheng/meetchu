<template lang='pug'>
div
  h3.text-center {{ title }}
  div.time-grid.pb-3
    div.time-grid-col
      div.time-grid-cell.empty
      div.time-grid-cell.header(v-for='time in times') {{ formatTime(time) }}
    div.time-grid-col(v-for='date in datetimes')
      div.time-grid-cell.header {{ formatDay(date[0].datetime) }}
      div.time-grid-cell(v-for='dt in date', @mousedown.left='_mousedown(dt, $event)', @mouseup='_mouseup', @mouseover='_mouseover(dt)', :class='style(dt)') {{ formatDatetime(dt.datetime) }}
  //- pre.
    {{ selectedDatetimes }}
</template>

<script>
import { mapGetters } from 'vuex';
import { chunk as _chunk, map as _map, range as _range, zipObject as _zipObject } from 'lodash';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

const selectClass = 'selected';

const selectStyle = {
  create: 'removed',
  rsvp: 'selected',
  finalize: 'final'
};

export default {
  name: 'meeting-time-grid',
  props: ['title', 'times', 'days', 'select', 'type'],
  created() {
    console.log(this.type);
    if (!this.type) {
      throw Error('No type was specified for MeetingTimeGrid. Pick [create/rsvp/finalize].');
    }
  },
  data() {
    return {
      datetimes: [],
      selectMode: true,
      mousedown: false
    }
  },
  computed: {
    selectedDatetimes() {
      let selected = [];
      this.datetimes.forEach((date, index) => {
        selected = selected.concat(this.datetimes[index].filter(dt => dt.selected).map(dt => dt.datetime));
      });
      selected.sort((a, b) => {
        return a - b;
      });
      return selected;
    }
  },
  watch: {
    days() {
      this.recalculateDatetimes();
    },
    times() {
      this.recalculateDatetimes();
    }
  },
  created() {
    this.recalculateDatetimes();
  },
  methods: {
    recalculateDatetimes() {
      if (!this.days || this.days.length === 0 || !this.times || this.times.length === 0) {
        this.datetimes = [];
        return;
      }
      const datetimes = this.days.map((d, dayIndex) => {
        const day = moment(d);
        const times = this.times.reduce((acc, t, timeIndex) => {
          const time = moment(t);
          const dt = {
            datetime: moment(day).hour(time.hour()).minute(time.minute()),
            row: timeIndex,
            col: dayIndex,
            selected: this.select
          }
          return acc.concat([dt]);
        }, []);
        return times;
      });
      this.datetimes = datetimes;
    },
    formatDay(d) {
      return moment(d).format('dd M/D');
    },
    formatTime(t) {
      return moment(t).format('h:mm A');
    },
    formatDatetime(dt) {
      return moment(dt).format('M/D h:mm A');
    },
    _mousedown(dt, event) {
      this.mousedown = true;
      this.selectMode = !dt.selected;
      this.toggleSelect(dt);
    },
    _mouseup() {
      this.mousedown = false;
    },
    _mouseover(dt, event) {
      if (this.mousedown) {
        this.toggleSelect(dt);
      }
    },
    toggleSelect(dt) {
      if (dt.selected !== this.selectMode) {
        dt.selected = this.selectMode;
      }
    },
    style(dt) {
      let classes = '';
      if (dt.selected) {
        classes += selectStyle[this.type] + ' ';
      }
      return classes;
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

$time-grid-border: 1px solid $gray-dark;

@mixin time-grid-col {
  display: flex;
  flex-direction: column;
}

@mixin time-grid-cell {
  font-size: 0.8rem;
  min-width: 110px;
  height: 30px;
  padding: 0.4rem 0.3rem;
  text-align: center;
}

.time-grid {
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow-x: scroll;

  .time-grid-col {
    &:last-of-type {
      .time-grid-cell {
        border-right: $time-grid-border;
      }
    }

    .time-grid-cell {
      &:first-of-type {
        min-width: 80px;
      }
      &:last-of-type {
        border-bottom: $time-grid-border;
      }
    }
  }
}

.time-grid-col {
  @include time-grid-col;
}

.time-grid-cell {
  @include time-grid-cell;
  cursor: pointer;
  user-select: none;
  border-top: $time-grid-border;
  border-left: $time-grid-border;

  &.removed {
    color: #000;
    background-color: #737373 !important;
  }
  &.selected {
    color: #000;
    background-color: #69ff73 !important;
  }
  &.empty {
    cursor: default;
    color: #fff;
    background-color: transparent !important;
    border-top: 0 !important;
    border-left: 0 !important;
    border-bottom: 0 !important;
  }
  &.header {
    cursor: default;
    color: #fff;
    background-color: $gray;
  }
}
</style>
