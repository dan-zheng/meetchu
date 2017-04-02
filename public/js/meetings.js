/* eslint-env browser jquery */

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getUTCFullYear();
const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

const monthInput = $('select#month');
const yearInput = $('select#year');
const calendar = d3.select('.calendar');

const selected = [];
const selectAttr = 'selected';
let state;
let startRow;
let startCol;
let endRow;
let endCol;
let mouseDown = false;

$(document).mousedown((e) => {
  mouseDown = true;
}).mouseup((e) => {
  mouseDown = false;
});

const getDate = (cell) => {
  return new Date(cell.attr('data-date'));
};

const toggleDate = (date) => {
  for (let i = 0; i < selected.length; i++) {
    if (selected[i].getTime() === date.getTime()) {
      selected.splice(i, 1);
      return;
    }
  }
  selected.push(date);
};

const updateCalendar = (date) => {
  const now = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getUTCFullYear();

  const monthFirstDay = new Date(currentYear, currentMonth, 1);
  const monthLastDay = new Date(currentYear, currentMonth + 1, 0);
  const calFirstDay = d3.timeSunday(monthFirstDay);
  const calLastDay = d3.timeWeek.offset(d3.timeSunday(monthLastDay), 1);

  const days = d3.timeDay.range(calFirstDay, calLastDay);

  calendar.selectAll('*').remove();
  calendar.append('div')
          .attr('class', 'cal-header')
          .selectAll('div')
          .data(Calendar.consts.dayAbbr)
          .enter()
          .append('div')
          .attr('type', 'div')
          .attr('class', 'cal-cell cal-cell-header')
          .text((d) => {
            return d;
          });

  calendar.append('div')
          .attr('class', 'cal-body')
          .selectAll('div')
          .data(days, (d) => { return d; })
          .enter()
          .append('div')
          .attr('type', 'div')
          .attr('data-date', (d) => {
            return d;
          })
          .attr('data-row', (d, i) => {
            return Math.floor(i / 7);
          })
          .attr('data-col', (d, i) => {
            return i % 7;
          })
          .attr('class', (d) => {
            let cellClass = d > now ? 'cal-cell' : 'cal-cell cal-cell-past';
            for (let i = 0; i < selected.length; i++) {
              if (selected[i].getTime() === d.getTime()) {
                cellClass += ` ${selectAttr}`;
                break;
              }
            }
            return cellClass;
          })
          .text((d) => {
            return d.getUTCDate();
          });

  const isBetween = (x, a, b, inclusive) => {
    inclusive = inclusive || true;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return inclusive ? x >= min && x <= max : x > min && x < max;
  };

  $('.cal-body .cal-cell').mousedown(function (e) {
    const cell = $(this);
    const date = getDate(cell);
    state = cell.hasClass(selectAttr);
    startRow = cell.attr('data-row');
    startCol = cell.attr('data-col');
    endRow = cell.attr('data-row');
    endCol = cell.attr('data-col');
    cell.toggleClass(selectAttr);
    toggleDate(date);
  });

  $('.cal-body .cal-cell').mouseover(function (e) {
    if (mouseDown) {
      const cell = $(this);
      const date = getDate(cell);
      const select = cell.hasClass(selectAttr);
      endRow = cell.attr('data-row');
      endCol = cell.attr('data-col');
      if (select === state) {
        $('.calendar .cal-body .cal-cell').filter(function(c) {
          const cell = $(this);
          const cellRow = cell.attr('data-row');
          const cellCol = cell.attr('data-col');
          const select = cell.hasClass(selectAttr);
          return select === state &&
              isBetween(cellRow, startRow, endRow) &&
              isBetween(cellCol, startCol, endCol);
        }).each((i, c) => {
          const cell = $(c);
          const date = getDate(cell);
          cell.toggleClass(selectAttr);
          toggleDate(date);
        });
      }
    }
  });
};

$.each(Calendar.consts.monthNames, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .prop('selected', value === Calendar.consts.monthNames[currentMonth])
  .text(value);
  monthInput.append(option);
});

$.each(years, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .prop('selected', value === currentYear)
  .text(value);
  yearInput.append(option);
});

monthInput.change(() => {
  const month = monthInput.find(':selected').text();
  const year = yearInput.find(":selected").text();
  const newDate = new Date(year, Calendar.parseMonth(month));
  updateCalendar(newDate);
});

yearInput.change(() => {
  const month = monthInput.find(':selected').text();
  const year = yearInput.find(":selected").text();
  const newDate = new Date(year, Calendar.parseMonth(month));
  updateCalendar(newDate);
});

updateCalendar(now);

const calendarCell = {
  template: '<div></div>'
};

const vueApp = new Vue({
  el: '#app',
  data: {
    message: 'Hello',
    checked: false,
    result: '',
    datetime: new Date()
  },
  components: {
    UiButton: KeenUI.UiButton,
    UiDatePacker: KeenUI.UiDatePacker
  },
  methods: {
    getRequest() {
      this.$http.get('/').then((res) => {
        console.log(res.body);
      });
    }
  }
});
