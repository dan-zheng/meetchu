const cal = new Calendar();
const date = new Date();
const currentMonth = date.getMonth();
const currentYear = date.getFullYear();
const weeks = cal.monthDays(currentYear, currentMonth);
const days = weeks.concat.apply([], weeks);

const yearArr = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

const monthInput = $('select#month');
const yearInput = $('select#year');

monthInput.attr('placeholder', Calendar.consts.monthNames[currentMonth]);
yearInput.attr('placeholder', currentYear);

$.each(Calendar.consts.monthNames, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .attr('selected', value === Calendar.consts.monthNames[currentMonth])
  .text(value);
  monthInput.append(option);
});

$.each(yearArr, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .attr('selected', value === currentYear)
  .text(value);
  yearInput.append(option);
});

const calendar = d3.select('.calendar');

calendar.selectAll('button')
        .data(Calendar.consts.dayAbbr)
        .enter()
        .append('button')
        .attr('class', 'calendar-cell calendar-header')
        .text((d) => {
          return d;
        });

calendar.selectAll('button')
        .data(days, (d) => d)
        .enter()
        .append('button')
        .attr('class', (d) => {
          return d > 0 ? 'calendar-cell' : 'calendar-cell empty';
        })
        .text((d) => {
          return d > 0 ? d : '';
        });
