const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getUTCFullYear();
const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

const monthInput = $('select#month');
const yearInput = $('select#year');
const calendar = d3.select('.calendar');

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
  calendar.selectAll('button')
          .data(Calendar.consts.dayAbbr)
          .enter()
          .append('button')
          .attr('type', 'button')
          .attr('class', 'calendar-cell calendar-header')
          .text((d) => {
            return d;
          });

  calendar.selectAll('button')
          .data(days, (d) => d)
          .enter()
          .append('button')
          .attr('type', 'button')
          .attr('class', (d) => {
            return d > now ? 'calendar-cell' : 'calendar-cell past';
          })
          .text((d) => {
            return d.getUTCDate();
          });
};

$.each(Calendar.consts.monthNames, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .attr('selected', value === Calendar.consts.monthNames[currentMonth])
  .text(value);
  monthInput.append(option);
});

$.each(years, (key, value) => {
  const option = $('<option></option>')
  .attr('value', key)
  .attr('selected', value === currentYear)
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
