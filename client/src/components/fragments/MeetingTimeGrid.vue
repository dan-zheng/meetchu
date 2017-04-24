<template lang='pug'>
div.time-grid-root
  h3.text-center {{ title }}
  div.time-grid.pb-3
    div.time-grid-col
      div.time-grid-cell.empty
      div.time-grid-cell.header(v-for='time in times') {{ formatTime(time) }}

    div.time-grid-col(v-for='date in datetimes')
      div.time-grid-cell.header {{ formatDay(date[0].datetime) }}
      div.time-grid-cell(v-for='dt in date', @mousedown.left='_mousedown(dt, $event)', @mouseup='_mouseup', @mouseover='_mouseover(dt)', :style='style(dt)', :class='classes(dt)', data-toggle='tooltip', :data-original-title='getSelectedUsers(dt)', data-animation='false')
        span(v-if='rsvpTimes && rsvpTimes[dt.datetime.unix()] && typeof rsvpTimes[dt.datetime.unix()].length !== "undefined"') {{ rsvpTimes[dt.datetime.unix()].length }}
        span(v-else) {{ formatDatetime(dt.datetime) }}
  h5(v-if='finalTime') Final Time: {{ new Date(finalTime).toLocaleString() }}
  //-
    div.time-grid-col(v-for='date in datetimes')
      div.time-grid-cell.header {{ formatDay(date[0].datetime) }}
      div.time-grid-cell(v-for='dt in date', @mousedown.left='_mousedown(dt, $event)', @mouseup='_mouseup', @mouseover='_mouseover(dt)', :style='style(dt)', :class='classes(dt)')
        span(v-if='rsvpTimes && typeof rsvpTimes[dt.datetime.unix()].length !== "undefined"') {{ rsvpTimes[dt.datetime.unix()].length }}
        span(v-else) {{ formatDatetime(dt.datetime) }}
  //- pre.
    {{ selectedDatetimes }}
</template>

<script>
import { mapGetters } from 'vuex';
import Color from 'color';
import { chunk as _chunk, map as _map, range as _range, zipObject as _zipObject } from 'lodash';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

const selectClass = 'selected';

const selectStyle = {
  view: 'viewing',
  create: '',
  rsvp: 'selected',
  finalize: 'final'
};

const deselectStyle = {
  view: '',
  create: 'removed',
  rsvp: '',
  finalize: ''
};

const startColor = Color('#5feea9');
const endColor = Color('#eee');

export default {
  name: 'meeting-time-grid',
  props: ['title', 'times', 'days', 'select', 'type', 'rsvp-times', 'user-count', 'final-time'],
  created() {
    if (!this.type) {
      throw Error('No type was specified for MeetingTimeGrid. Pick [create/rsvp/finalize].');
    }
    if (this.days && this.times && this.hasRsvp) {
      this.recalculateDatetimes();
    }
  },
  mounted() {
    this.initTooltips();
  },
  data() {
    return {
      datetimes: [],
      lastSelected: null,
      selectMode: true,
      mousedown: false
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    }),
    selectedDatetimes() {
      let selected = [];
      this.datetimes.forEach((date, index) => {
        selected = selected.concat(this.datetimes[index].filter(dt => dt.selected).map(dt => dt.datetime));
      });
      selected.sort((a, b) => {
        return a - b;
      });
      return selected;
    },
    hasRsvp() {
      return this.rsvpTimes && Object.keys(this.rsvpTimes).length > 0;
    },
    canSelectMany() {
      return this.type === 'rsvp' || this.type === 'create';
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
          const datetime = moment(day).hour(time.hour()).minute(time.minute());
          const dt = {
            datetime,
            row: timeIndex,
            col: dayIndex,
            selected: this.canSelectMany && (this.select || (this.hasRsvp && this.rsvpTimes[moment(datetime).unix()].some(u => u.id === this.user.id)))
          };
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
      if (this.type === 'create') {
        return moment(dt).format('M/D h:mm A');
      }
      return moment(dt).format('M/D h:mm A');
    },
    _mousedown(dt, event) {
      this.mousedown = true;
      this.selectMode = !dt.selected;
      this.toggleSelect(dt, event);
    },
    _mouseup() {
      this.mousedown = false;
    },
    _mouseover(dt, event) {
      if (this.mousedown) {
        this.toggleSelect(dt);
      }
    },
    getSelectedUsers(dt) {
      if (this.rsvpTimes) {
        const users = this.rsvpTimes[moment(dt.datetime).unix()];
        if (!users) {
          return '';
        }
        if (users.length < 5) {
          return users.map(u => u.first_name).sort().join(', ');
        } else {
          return `${users.length} users`;
        }
      }
    },
    initTooltips() {
      $('[data-toggle="tooltip"]').tooltip();
    },
    toggleSelect(dt, event) {
      if (!this.canSelectMany) {
        if (this.finalTime && this.type === 'finalize') {
          return;
        }
        if (this.lastSelected) {
          this.lastSelected.selected = false;
          if (this.lastSelected.datetime == dt.datetime) {
            this.lastSelected = null;
            return;
          }
        }
        dt.selected = true;
        this.lastSelected = dt;
        return;
      }
      if (dt.selected !== this.selectMode) {
        dt.selected = this.selectMode;
        if (this.rsvpTimes) {
          if (this.selectMode) {
            this.rsvpTimes[moment(dt.datetime).unix()].push({
              id: this.user.id,
              first_name: this.user.first_name,
              last_name: this.user.last_name
            });
            if (event) {
              $(event.target).attr('data-original-title', this.getSelectedUsers(dt));
              $(event.target).tooltip('show');
            }
          } else {
            this.rsvpTimes[moment(dt.datetime).unix()] = this.rsvpTimes[moment(dt.datetime).unix()].filter(u => u.id !== this.user.id);
            if (event) {
              $(event.target).tooltip('hide');
            }
          }
        }
      }
    },
    style(dt) {
      let styles = '';
      if (this.userCount && this.hasRsvp && this.rsvpTimes[moment(dt.datetime).unix()]) {
        const ratio = this.rsvpTimes[moment(dt.datetime).unix()].length / this.userCount;
        styles += `background-color: ${startColor.mix(endColor, ratio)}`;
      }
      return styles;
    },
    classes(dt) {
      let classes = '';
      if (dt.selected) {
        classes += selectStyle[this.type] + ' ';
      } else {
        classes += deselectStyle[this.type] + ' ';
      }
      if (this.formatDatetime(dt.datetime) === this.formatDatetime(moment(this.finalTime))) {
        classes += 'finalized ';
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
  line-height: 26px;
  height: 30px;
  padding: 3px;
  margin: 1px;
  text-align: center;
  background-color: $gray-lighter;
}

.time-grid-root {

}

.time-grid {
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow-x: scroll;
  justify-content: flex-start;
  // justify-content: center;

  .time-grid-col {
    .time-grid-cell {
      &:first-of-type {
        min-width: 80px;
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

  &.removed {
    color: #000;
    background-color: #737373 !important;
  }
  &.selected {
    padding: 0;
    border: 3px dashed #1cd078 !important;
  }
  &.final {
    padding: 0;
    border: 3px dashed $brand-primary !important;
  }
  &.finalized {
    padding: 0;
    color: #fff;
    background-color: $brand-primary !important;
    border: 3px solid darken($brand-primary, 15%) !important;
  }
  &.viewing {
    padding: 0;
    border: 2px solid #a079ff !important;
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
