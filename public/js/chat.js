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

// Socket.io
const socket = io.connect(document.getAttribute('data-socket-address'));

const script = document.getElementById('chat');
const groupId = script.getAttribute('data-group-id');
const messageHistory = JSON.parse(script.getAttribute('data-message-history'));
const sender = JSON.parse(script.getAttribute('data-sender'));
const maxMessages = JSON.parse(script.getAttribute('data-max-messages'));
var messageCount = 0;

function addMessage(msg) {
  while (messageCount >= maxMessages) {
    $('#chat-box li').first().remove();
    messageCount -= 1;
  }
  const line = $('<li>').text(`${msg.senderName}: ${msg.body}`);
  $('#chat-box').append(line);
  messageCount += 1;
}

messageHistory.forEach((msg) => {
  addMessage(msg);
});

$('#chat-form').submit((ev) => {
  const inputField = $('#chat-message');
  const message = { senderName: sender.name, body: inputField.val(), timeSent: new Date() };
  if (message.body) {
    const messagePayload = { groupId, senderId: sender.id, message };
    socket.emit('send message', messagePayload);
    inputField.val('');
  }
  ev.preventDefault();
});

socket.on(`receive message ${groupId}`, (msg) => {
  addMessage(msg);
});
