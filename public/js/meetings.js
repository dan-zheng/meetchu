const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getUTCFullYear();
const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

const monthInput = $('select#month');
const yearInput = $('select#year');
const calendar = d3.select('.calendar');

let selected = [];
let state;

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
          .data(days, (d) => d)
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

  $('.cal-body .cal-cell').mousedown(function(e) {
    state = $(this).hasClass(selectAttr);
    console.log(state);
  });

  $('.cal-body').mousedown((e) => {
    e.metaKey = true;
  }).selectable({
    selecting(event, ui) {
      console.log('selecting, state = ' + state);
      if (state) {
        $(ui.selecting).removeClass(selectAttr);
      } else {
        $(ui.selecting).addClass(selectAttr);
      }
    },
    /*
    unselecting(event, ui) {
      console.log('unselecting, state = ' + state);
      if (state) {
        $(ui.unselecting).removeClass('ui-selected');
      } else {
        $(ui.unselecting).addClass('ui-selected');
      }
    },
    */
    selected(event, ui) {
      console.log('selected, state = ' + state);
      const select = $(ui.selected).hasClass('ui-selecting');
      if (select) {
        $(ui.selected).removeClass(selectAttr);
      } else {
        $(ui.selected).addClass(selectAttr);
      }
    },
    /*
    unselected(event, ui) {
      const select = $(ui.selected).hasClass('ui-selecting');
      if (select) {
        $(ui.unselected).removeClass('ui-selected');
      } else {
        $(ui.unselected).addClass('ui-selected');
      }
    }
    */
    /*
     selecting(event, ui) {
     selected: (event, ui) {
     test = ui;
     const cell = $(ui.selected).find('.cal-cell');
     co
     const year = yearInput.find(":selected").text();
     const date = new Date(year, Calendar.parseMonth(month), cell.text());
     console.log(cell);
     console.log(date);
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
     }
     }
     */
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
