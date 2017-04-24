<template lang='pug'>
div
  h3.text-center {{ title }}
  div.calendar
    .d-flex.justify-content-between.mb-2
      .col-sm-6
        b-form-select.w-100(v-model='month', :options='months')
      .col-sm-6
        b-form-select.w-100(v-model='year', :options='years')
    div.calendar-week
      div.calendar-day.calendar-header(v-for='weekday in weekdays') {{ weekday }}
    div.calendar-week(v-for='(week, weekIndex) in weeks')
      div.calendar-day(v-for='(day, dayIndex) in week', :key='day', @mousedown.left='_mousedown(day, $event)', @mouseup='_mouseup', @mouseover='_mouseover(day)', :class='style(day)') {{ day.day.format('D') }}
  //- pre.
    {{ selectedDays.map(d => d.day) }}
</template>

<script>
import { mapGetters } from 'vuex';
import { chunk as _chunk, range as _range, zipObject as _zipObject } from 'lodash';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

const selectClass = 'selected';

export default {
  name: 'calendar',
  props: ['title'],
  created() {
    this.now = moment();
    this.key = moment(this.now).startOf('month');
    this.month = moment(this.key).month();
    this.year = moment(this.key).year();
    this.recalculate();
  },
  data() {
    return {
      key: null,
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
      const start = moment(this.key).year();
      const years = _range(start, start + 4, 1);
      return years;
    },
    weekdays() {
      return moment.weekdaysShort();
    },
    selectedDays() {
      let selected = [];
      Object.keys(this.days).forEach((key) => {
        selected = selected.concat(this.days[key].filter(d => d.selected).map(d => d.day));
      });
      selected.sort((a, b) => {
        return a - b;
      });
      return selected;
    }
  },
  watch: {
    month(newValue, oldValue) {
      if (oldValue) {
        this.key.month(newValue);
        this.recalculate();
      }
    },
    year(newValue, oldValue) {
      if (oldValue) {
        this.key.year(newValue);
        this.recalculate();
      }
    }
  },
  methods: {
    recalculate() {
      const start = moment(this.key).startOf('month').startOf('week');
      const end = moment(this.key).endOf('month').endOf('week');
      const range = moment.range(start, end);
      const days = Array.from(range.by('day'));
      // Set days
      if (!this.days[this.key]) {
        const _days = days.map((d, i) => {
          return {
            day: d,
            row: i / 7,
            col: i % 7,
            selected: false
          };
        });
        this.$set(this.days, this.key, _days);
      }
      this.weeks = _chunk(this.days[this.key], 7);
    },
    style(day) {
      let classes = '';
      if (day.day.isSame(this.now, 'day')) {
        classes += 'today ';
      } else if (day.day.isBefore(this.now, 'day')) {
        classes += 'past ';
      } else {
        classes += 'future ';
      }
      if (day.selected) {
        classes += 'selected ';
      }
      return classes;
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
        day.selected = this.selectMode;
      }
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

// $calendar-border: 1px solid $grid-border-color;
// $calendar-border: 2px solid #fff;
$calendar-border: 1px solid $gray;

@mixin calendar-row {
  display: flex;
  justify-content: flex-start;
}

@mixin calendar-cell {
  font-size: 1.1rem;
  width: 100%;
  padding: 0.8rem 0.3rem;
  text-align: center;
}

.calendar {
  .calendar-week {
    &:last-of-type {
      .calendar-day {
        border-bottom: $calendar-border;
      }
    }

    .calendar-day {
      &:last-of-type {
        border-right: $calendar-border;
      }
    }
  }
}

.calendar-week {
  @include calendar-row;
}

.calendar-day {
  @include calendar-cell;
  cursor: pointer;
  user-select: none;
  border-top: $calendar-border;
  border-left: $calendar-border;

  &.past {
    color: #fff;
    // background-color: #b3aefa;
    background-color: #cecafe;
  }
  &.today {
    color: #fff;
    // background-color: #66c3ff;
    background-color: #4bbcfd;
  }
  &.future {
    color: #fff;
    // background-color: #928bff;
    // background-color: #584cfd;
    background-color: darken(#cecafe, 20%);
  }
  &.selected {
    color: #000;
    background-color: #69ff73 !important;
  }
  &.calendar-header {
    cursor: default;
    color: #fff;
    background-color: lighten($gray, 5%);
  }
}
</style>
