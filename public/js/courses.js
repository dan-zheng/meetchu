// Search configuration
// const client = algoliasearch('4977PJKR36', '01af7222321161de5a290b840b90b456');
const client = algoliasearch('8NC5DAIBAS', '17a1d9aa3e455702917e6237891af591');
const index = client.initIndex('courses');

// DOM Binding
const searchInput = $('#aa-search-input');
const hiddenInput = $('#aa-search-hidden');
const inputContainer = $('#aa-input-container');

// Helper function for removing HTML tags
const removeTags = ((input) => {
  return input.replace(/(<([^>]+)>)/ig, "");
});

// Initialize autocomplete on search input (ID selector must match)
searchInput.autocomplete({
  autoselect: true,
  hint: false
}, [{
  source: $.fn.autocomplete.sources.hits(index, { hitsPerPage: 5 }),
  // Value to be displayed in input control after user's suggestion selection
  displayKey: 'name',
  // Hash of templates used when rendering dataset
  templates: {
    // 'suggestion' templating function used to render a single suggestion
    suggestion(suggestion) {
      return '<span>' + suggestion._highlightResult.title.value + '</span><span>' +
        suggestion._highlightResult.courseID.value +
        '</span>';
    }
  }
}]);

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
// When autocomplete is selected, set the value of searchInput to the suggestion.
searchInput.on('autocomplete:selected', (event, suggestion, dataset) => {
  searchInput.autocomplete('val', removeTags(suggestion._highlightResult.courseID.value));
  hiddenInput.val(removeTags(suggestion.objectID));
});

// Event handler:
// When #icon-close is clicked, clear searchInput and remove class 'input-has-value'.
// This changes the icon from 'close' to 'search'.
$('#icon-close').on('click', () => {
  searchInput.val('');
  hiddenInput.val('');
  inputContainer.removeClass('input-has-value');
});
