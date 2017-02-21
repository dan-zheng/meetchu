// Initialize autocomplete menu
const client = algoliasearch('8NC5DAIBAS', '90e970160f1e67e1ee19fe02af4ea530');
const index = client.initIndex('subjects');

// DOM Binding
const searchInput = $('#aa-search-input');
const inputContainer = $('#aa-input-container');

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
      return '<span>' + suggestion._highlightResult.Name.value + '</span><span>' + suggestion._highlightResult.Abbreviation.value + '</span>';
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
  searchInput.autocomplete('val', suggestion.Name);
});

// Event handler:
// When #icon-close is clicked, clear searchInput and remove class 'input-has-value'.
// This changes the icon from 'close' to 'search'.
$('#icon-close').on('click', () => {
  searchInput.val('');
  inputContainer.removeClass('input-has-value');
});
