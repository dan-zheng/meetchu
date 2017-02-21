// Initialize autocomplete menu
const client = algoliasearch("8NC5DAIBAS", "90e970160f1e67e1ee19fe02af4ea530");
const index = client.initIndex('subjects');
// Initialize autocomplete on search input (ID selector must match)
$('#aa-search-input').autocomplete({ hint: false }, [{
  source: $.fn.autocomplete.sources.hits(index, { hitsPerPage: 5 }),
  // value to be displayed in input control after user's suggestion selection
  displayKey: 'name',
  // hash of templates used when rendering dataset
  templates: {
    // 'suggestion' templating function used to render a single suggestion
    suggestion(suggestion) {
      return '<span>' + suggestion._highlightResult.Name.value + '</span><span>' + suggestion._highlightResult.Abbreviation.value + '</span>';
    }
  }
}]);
