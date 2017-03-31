const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getUTCFullYear();
const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

const monthInput = $('select#month');
const yearInput = $('select#year');
const calendar = d3.select('.calendar');

const selected = [];
let state;
let mouseDown = false;

$(document).mousedown((e) => {
  mouseDown = true;
}).mouseup((e) => {
  mouseDown = false;
});

const getDate = (cell) => {
  const month = monthInput.find(':selected').text();
  const year = yearInput.find(":selected").text();
  return new Date(year, Calendar.parseMonth(month), cell.text());
};

const toggleDate = (date) => {
  if (selected.indexOf(date) === -1) {
    selected.push(date);
  } else {
    selected.splice(selected.indexOf(date), 1);
  }
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
          .attr('class', (d) => {
            return d > now ? 'cal-cell' : 'cal-cell cal-cell-past';
          })
          .text((d) => {
            return d.getUTCDate();
          });

  const selectAttr = 'selected';

  $('.cal-body .cal-cell').mousedown(function (e) {
    const cell = $(this);
    const date = getDate(cell);
    state = cell.hasClass(selectAttr);
    console.log(state);
    cell.toggleClass(selectAttr);
    toggleDate(date);
  });

  $('.cal-body .cal-cell').mouseover(function (e) {
    console.log('mouseover');
    if (mouseDown) {
      const cell = $(this);
      const date = getDate(cell);
      const select = cell.hasClass(selectAttr);
      if (select === state) {
        cell.toggleClass(selectAttr);
        toggleDate(date);
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

/*
$('.calendar-cell').mousedown(function() {
  const cell = $(this);
  const month = monthInput.find(':selected').text();
  const year = yearInput.find(":selected").text();
  const date = new Date(year, Calendar.parseMonth(month), cell.text());
  cell.attr('selected', (i, v) => {
    v = !v;
    if (v) {
      selected.push(date);
    } else {
      selected.splice(selected.indexOf(date), 1);
    }
    console.log(selected);
    return v;
  });
});
*/
