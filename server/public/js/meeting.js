/* eslint-env browser jquery */

// Search configuration
const client = algoliasearch('4977PJKR36', '01af7222321161de5a290b840b90b456');
const index = client.initIndex('users');

// DOM Binding
const searchInput = $('#aa-search-input');
const inputContainer = $('#aa-input-container');

// Helper variables
const numOfResultsDisplayed = 5;
let lastQuery = '';

// Helper function for removing HTML tags
const removeTags = ((input) => {
  return input.replace(/(<([^>]+)>)/ig, "");
});

// Initialize autocomplete on search input (ID selector must match)
searchInput.textcomplete([{
  // Regular expression used to trigger the autocomplete dropdown
  match: /(^)(.*)$/,
  // Function called at every new keystroke
  search: (query, callback) => {
    lastQuery = query;
    index.search(lastQuery, { hitsPerPage: numOfResultsDisplayed })
         .then((content) => {
           if (content.query === lastQuery) {
             callback(content.hits);
           }
         })
         .catch((err) => {
           console.error(err);
         });
  },
  // Template used to display each result obtained by the Algolia API
  template: (hit) => {
    // Returns the highlighted version of the name attribute
    return '<span>' + hit._highlightResult.email.value + ' </span><span class="hspace"></spam><span>' +
        hit._highlightResult.firstName.value + ' ' + hit._highlightResult.lastName.value +
        '</span>';
  },
  // Template used to display the selected result in the textarea
  replace: (hit) => {
    return hit.email.trim();
  }
}], {
  // footer: '&lt;div style="text-align: center; display: block; font-size:12px; margin: 5px 0 0 0;"&gt;Powered by &lt;a href="http://www.algolia.com"&gt;&lt;img src="https://www.algolia.com/assets/algolia128x40.png" style="height: 14px;" /&gt;&lt;/a&gt;&lt;/div&gt;'
});

// Event handler:
// When autocomplete is updated, find length of its value and add/remove class 'input-has-value'.
// This changes the icon rendered in the input.
searchInput.on('autocomplete:updated', () => {
  if (searchInput.val().length > 0) {
    inputContainer.addClass('input-has-value');
  } else {
    inputContainer.removeClass('input-has-value');
  }
});

// Event handler:
// When #icon-close is clicked, clear searchInput and remove class 'input-has-value'.
// This changes the icon from 'close' to 'search'.
$('#icon-close').on('click', () => {
  searchInput.val('');
  inputContainer.removeClass('input-has-value');
});

/*
 * Meeting RSVP.
 */

let origSelected = JSON.parse(_datetimes.replace(/&quot;/g, '"'));
origSelected = origSelected.map((dt) => {
  return new Date(dt);
});
const selected = origSelected.slice(0);
const deselected = [];
const selectAttr = 'selected';
const origSelectAttr = 'data-orig-select';
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
  return new Date(cell.attr('data-datetime'));
};

const updateColor = (cell) => {
  const color = $.xcolor.gradientlevel('#eee', '#5feea9', cell.attr('data-color'), 1);
  cell.css('background-color', color);
  // cell.css('border-color', color);
}

const toggleDate = (cell, showTooltip) => {
  const date = getDate(cell);
  const isOrigSelect = cell.attr(origSelectAttr) !== undefined;
  for (let i = 0; i < selected.length; i += 1) {
    if (selected[i].getTime() === date.getTime()) {
      // Update cell text
      const text = cell.text(parseInt(cell.text()) - 1).text();
      // Update cell color
      cell.attr('data-color', parseInt(text) / numUsers);
      updateColor(cell);
      // Update tooltip
      const users = cell.attr('data-original-title').split(', ');
      users.splice(users.indexOf(username), 1);
      const newTitle = users.join(', ');
      if (newTitle.length === 0) {
        cell.attr('data-original-title', newTitle)
            .tooltip('hide');
      } else {
        cell.attr('data-original-title', newTitle);
        if (showTooltip) {
          cell.tooltip('show');
        }
      }
      // Handle selection/deselection
      selected.splice(i, 1);
      if (isOrigSelect) {
        /*
        if (deselected.map(Number).indexOf(+date) === -1) {
          console.log(date);
          deselected.push(date);
        }
        */
        for (let j = 0; j < deselected.length; j += 1) {
          if (deselected[j].getTime() === date.getTime()) {
            return;
          }
        }
        deselected.push(date);
      }
      return;
    }
  }
  // Update cell text
  const text = cell.text(parseInt(cell.text()) + 1).text();
  // Update cell color
  cell.attr('data-color', parseInt(text) / numUsers);
  updateColor(cell);
  // Update tooltip
  const users = cell.attr('data-original-title').split(', ').filter((v) => { return v; });
  users.push(username);
  const newTitle = users.join(', ');
  cell.attr('data-original-title', newTitle);
  if (showTooltip) {
    cell.tooltip('show');
  }
  // Handle selection/deselection
  selected.push(date);
  if (isOrigSelect) {
    for (let i = 0; i < deselected.length; i += 1) {
      if (deselected[i].getTime() === date.getTime()) {
        deselected.splice(i, 1);
      }
      return;
    }
  }
};

$('#table-rsvp tbody .dt-cell-grid').each(function () {
  // Set background color
  const cell = $(this);
  updateColor(cell);
  // Enable tooltip
  cell.tooltip();
  // Add to selected array if selected
  if (!!cell.attr(selectAttr)) {
    toggleDate(cell);
  }
});

const isBetween = (x, a, b, inclusive) => {
  inclusive = inclusive || true;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return inclusive ? x >= min && x <= max : x > min && x < max;
};

$('#table-rsvp tbody .dt-cell-grid').mousedown(function (e) {
  const cell = $(this);
  const showTooltip = true;
  state = cell.hasClass(selectAttr);
  startRow = cell.attr('data-row');
  startCol = cell.attr('data-col');
  endRow = cell.attr('data-row');
  endCol = cell.attr('data-col');
  cell.toggleClass(selectAttr);
  toggleDate(cell, showTooltip);
});

$('#table-rsvp tbody .dt-cell-grid').mouseover(function (e) {
  if (mouseDown) {
    const cell = $(this);
    const showTooltip = false;
    const select = cell.hasClass(selectAttr);
    endRow = cell.attr('data-row');
    endCol = cell.attr('data-col');
    if (select === state) {
      $('#table-rsvp tbody .dt-cell-grid').filter(function (c) {
        const cell = $(this);
        const cellRow = cell.attr('data-row');
        const cellCol = cell.attr('data-col');
        const select = cell.hasClass(selectAttr);
        return select === state &&
            isBetween(cellRow, startRow, endRow) &&
            isBetween(cellCol, startCol, endCol);
      }).each((i, c) => {
        const cell = $(c);
        cell.toggleClass(selectAttr);
        toggleDate(cell, showTooltip);
      });
    }
  }
});

$('form#form-rsvp').submit(function() {
  // event.preventDefault();
  const _selected = selected.filter((dt) => {
    return origSelected.map(Number).indexOf(+dt) === -1;
  });
  console.log('selected');
  console.log(JSON.stringify(_selected, null, 2));
  console.log('deselected');
  console.log(JSON.stringify(deselected, null, 2));
  for (let i = 0; i < _selected.length; i += 1) {
    $('<input>').attr('type', 'hidden')
                .attr('name', 'selected[]')
                .attr('value', _selected[i])
                .appendTo(this);
  }
  for (let i = 0; i < deselected.length; i += 1) {
    $('<input>').attr('type', 'hidden')
                .attr('name', 'deselected[]')
                .attr('value', deselected[i])
                .appendTo(this);
  }
  // $(this).unbind('submit').submit();
});

/*
 * Finalize meeting time.
 */

let finalCell;
const finalClass = 'final';

const finalizeSelect = (cell) => {
  if (finalCell) {
    finalCell.removeClass(finalClass);
    if (cell.is(finalCell)) {
      finalCell = null;
      return;
    }
  }
  finalCell = cell;
  cell.addClass(finalClass);
};

$('#table-finalize tbody .dt-cell-grid').each(function () {
  // Set background color
  const cell = $(this);
  updateColor(cell);
  // Enable tooltip
  cell.tooltip();
});

$('#table-finalize tbody .dt-cell-grid').mousedown(function (e) {
  const cell = $(this);
  finalizeSelect(cell);
});

$('form#form-finalize').submit(function() {
  // event.preventDefault();
  const dt = new Date(finalCell.attr('data-datetime'));
  $('<input>').attr('type', 'hidden')
              .attr('name', 'finalTime')
              .attr('value', dt)
              .appendTo(this);
  // $(this).unbind('submit').submit();
});

/*
 * Finalized meeting time.
 */
$('#table-finalized tbody .dt-cell-grid').each(function () {
  // Set background color
  const cell = $(this);
  updateColor(cell);
  // Enable tooltip
  cell.tooltip();
});
