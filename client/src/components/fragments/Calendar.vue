<template lang='pug'>
div
  div.calendar
    .d-flex.justify-content-between
      .col-sm-6
        b-form-select.w-100(v-model='month', :options='months')
      .col-sm-6
        b-form-select.w-100(v-model='year', :options='years')
    div.calendar-week
      div.calendar-day(v-for='weekday in weekdays') {{ weekday }}
    div.calendar-week(v-for='(week, weekIndex) in weeks')
      div.calendar-day(v-for='(day, dayIndex) in week', :key='day', @mousedown='_mousedown(day, $event)', @mouseup='_mouseup', @mouseover='_mouseover(day)', :class='style(day)') {{ day.day.format('D') }}
  pre.
    {{ selectedDays.map(d => d.day) }}
  // {{ store }}
  // {{ selectedDays.map(d => d.day) }}
</template>

<script>
import { mapGetters } from 'vuex';
import { chunk as _chunk, map as _map, range as _range, zipObject as _zipObject } from 'lodash';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

const selectClass = 'selected';

export default {
  name: 'calendar',
  props: ['title'],
  created() {
    this.now = moment().startOf('month');
    this.month = moment(this.now).month();
    this.year = moment(this.now).year();
    this.recalculate();
  },
  data() {
    return {
      now: null,
      month: null,
      year: null,
      days: [],
      weeks: [],
      store: {},
      selectMode: true,
      mousedown: false
    }
  },
  computed: {
    months() {
      const keys = _range(0, 12);
      const values = moment.monthsShort();
      const months = _zipObject(keys, values);
      return months;
    },
    years() {
      const start = moment(this.now).year();
      const years = _range(start, start + 4, 1);
      return years;
    },
    weekdays() {
      return moment.weekdaysShort();
    },
    selectedDays() {
      let selected = [];
      Object.keys(this.days).forEach((key) => {
        selected = selected.concat(this.days[key].filter(d => d.selected));
      });
      selected.sort((a, b) => {
        return a.day - b.day;
      });
      return selected;
    }
  },
  watch: {
    month(newValue, oldValue) {
      if (oldValue) {
        this.now.month(newValue);
        this.recalculate();
      }
    },
    year(newValue, oldValue) {
      if (oldValue) {
        this.now.year(newValue);
        this.recalculate();
      }
    }
  },
  methods: {
    recalculate() {
        const start = moment(this.now).startOf('month').startOf('week');
        const end = moment(this.now).endOf('month').endOf('week');
        const range = moment.range(start, end);
        const days = Array.from(range.by('day'));
        // Set days
        if (!this.days[this.now]) {
          const _days = _.map(days, (d) => {
            return {
              day: d,
              selected: false
            };
          });
          this.$set(this.days, this.now, _days);
        }
        this.weeks = _chunk(this.days[this.now], 7);
    },
    style(day) {
      if (day.selected) {
        return 'selected';
      }
      return '';
    },
    _mousedown(day, event) {
      this.mousedown = true;
      this.selectMode = !day.selected;
      this.toggleSelect(day);
    },
    _mouseup() {
      this.mousedown = false;
    },
    _mouseover(day, event) {
      if (this.mousedown) {
        this.toggleSelect(day);
      }
    },
    toggleSelect(day) {
      if (day.selected !== this.selectMode) {
        this.$set(day, 'selected', this.selectMode);
        console.log('hi');
        // day.selected = this.selectMode;
      }
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

$calendar-border: 1px solid $grid-border-color;

@mixin calendar-row {
  display: flex;
  justify-content: flex-start;
  border-left: $calendar-border;
  border-right: $calendar-border;
}

@mixin calendar-cell {
  width: 100%;
  padding: 1rem 0.3rem;
  text-align: center;
}

.calendar {
  .calendar-week {
    border-top: $calendar-border;

    &:last-of-type {
      border-bottom: $calendar-border;
    }

    .calendar-day {
      border-right: $calendar-border;

      &:last-of-type {
        border-right: 0;
      }
    }
  }
}

.calendar-week {
  @include calendar-row;
}

.calendar-day {
  @include calendar-cell;
  cursor: default;
  user-select: none;

  &.selected {
    background-color: #dbd9fa;
  }
}
</style>
