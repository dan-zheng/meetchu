<template lang='pug'>
#content.d-flex
  #chats.d-flex.flex-column.col-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Chats
      span.d-flex.px-0.ml-auto.align-items-center
        //- NOTE: Create new chat button
        a.text-primary(@click='clear(["userHits", "userQuery"]); startNewChat();')
          i.fa.fa-lg.fa-plus-square
    #chats-list
      p.text-muted.px-3.py-2.my-0(v-if='!hasNewChat && !hasChats') You are not in any chats.
      .list-group(v-else)
        .list-group-item.list-group-item-action.chat.rounded-0.border(v-if='hasNewChat', :class='{ active: isCurrentChatNew }', @click='setCurrentChat(newChat, true)')
          .d-flex.w-100.justify-content-between.flex-wrap
            h5.mb-1 New Chat
        .list-group-item.list-group-item-action.chat.rounded-0.border(v-for='chat in sortedChats', :key='chat.name', :class='{ active: currentChat == chat }', @click='setCurrentChat(chat)')
          //- TODO: Need to refactor
          .list-group-item.p-0.border-0(v-if='hasChatLastSent(chat)', style='background-color: transparent;')
            .d-flex.w-100.justify-content-between.flex-wrap
              h5.mb-1 {{ chat.name }}
              small {{ formatDate(chat.last_time_sent) }}
            p.mb-1(v-if='hasChatLastSent(chat)')
              router-link.no-link-style(:to='"/profile/" + chat.sender_id')
                strong {{ chat.sender_first_name + ' ' + chat.sender_last_name }}
              | : {{ chat.last_message_body }}
          .d-flex.w-100.justify-content-between.flex-wrap(v-else)
            h5.word-wrap.mb-1 {{ chat.name }}
  #current-chat.d-flex.flex-column.col-8.px-0(v-model='currentChat')
    #chat-name.d-flex.text-center.px-4.align-items-stretch(v-if='hasCurrentChat')
      span.ml-auto
      h2.my-2(style='min-height: 35px') {{ currentChat.name }}
      span.d-flex.px-0.ml-auto.align-items-center
        a.ml-auto(@click='showModal("#chat-settings-modal")')
          i.fa.fa-lg.fa-cog
    .d-flex.text-center.px-4.align-items-center(v-else)
      h2.mx-auto.my-2(style='min-height: 35px')
        span(v-if='isCurrentChatNew') Create a chat
        span(v-else) Chat Info
    #messages-list
      // #messages-list(@scroll='handleScroll')
      div(v-if='isCurrentChatNew')
        #new-chat-input.d-flex.align-items-center
          span.mx-2 To:
          input#user-search-input.px-2(v-model='userQuery', placeholder='Search for users...', @keyup='search("userHits", userQuery)')

        .card.m-3.p-2
          small.text-info(v-if='userHits.length > 0') Matches
          small.text-warning(v-else-if='userQuery.length > 0 && typeof newChat !== "undefined"') No matches.
          .list-group
            .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedHitUsers', :key='user.objectId', @click='addUserToNewChat(user, index)')
              .d-flex.w-100.mx-1.justify-content-between.align-items-center
                h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                small.text-right(style='min-width: 80px;') {{ user.email }}
          small.text-success(v-if='newChat.users.length > 0') Selected
          .list-group
            .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedNewChatUsers', :key='user.id', @click='removeUserFromNewChat(user, index)')
              .d-flex.w-100.mx-1.justify-content-between.align-items-center
                i.fa.fa-check.text-success
                h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                small.text-right(style='min-width: 80px;') {{ user.email }}
          .py-2.text-center
            button.btn.btn-primary(v-on:click='createChat(newChat)')
              i.fa.fa-plus-circle
              | Create chat

      p.text-muted.px-3.py-2.my-0(v-else-if='!hasChats') Create a chat to start messaging!
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasCurrentChat') Click on a chat!
      //- // NOTE: Save until adding users to chat is completed
        p.text-muted.px-3.py-2.my-0(v-else-if='!hasCurrentChatUsers') Add another user to start chatting!
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasChatMessages(currentChat)') Send a message!
      .list-group(v-else, v-resize='onMessageListResize', @scroll='handleScroll')
        .list-group-item.message.rounded-0.border.mt-auto(v-for='msg in currentChat.messages', :key='msg.id', :class='{ "message-new": msg.new }')
          span.text-primary(v-if='msg.sender_id === user.id') {{ msg }}
          span.text-success(v-else) {{ msg }}
    #message-box(v-if='hasChats && !isCurrentChatNew && hasCurrentChat')
      input.px-3(v-model='currentMsg[currentChat.id]', placeholder='Type message...', @keyup.enter='sendMessage(currentChat)')
      //- // NOTE: Save until adding users to chat is completed
        input.px-3(v-if='hasCurrentChatUsers', v-model='currentMsg[currentChat.id]', placeholder='Type message...', @keyup.enter='sendMessage(currentChat)')
        input.px-3(v-else, v-model='currentMsg[currentChat.id]', placeholder='Add another user to chat!', disabled)

  //- Modals
  .modal.fade#chat-settings-modal(tabindex='-1', role='dialog', aria-labelledby='chatSettingsModalLabel', aria-hidden='true')
    .modal-dialog.modal-md
      .modal-content
        .modal-header
          h5.modal-title Chat settings
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
          h6 Chat users
          .list-group.mb-2(v-if='hasCurrentChat')
            div(v-for='user in currentChat.users', :key='user.email')
              a.list-group-item.list-group-item-action.user.rounded-0.border(@click='goToProfile(user.id)')
                .d-flex.w-100.mx-1.justify-content-between.align-items-center
                  h5.mb-0 {{ user.first_name + ' ' + user.last_name }}
                  small.text-right {{ user.email }}
          .py-2.text-center
            button.btn.btn-danger(v-on:click='removeChat(currentChat)')
              i.fa.fa-minus-square
              | Leave this chat
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import { default as swal } from 'sweetalert2';
import resize from 'vue-resize-directive'
import { userIndex } from '../common/algolia';
import { validationStyle, resetForm } from '../common/form';

export default {
  name: 'chats',
  metaInfo: {
    title: 'Chats'
  },
  directives: {
    resize,
  },
  data() {
    return {
      newChat: null,
      currentChat: {},
      isCurrentChatNew: false,
      hasScrolled: false,
      formstate: {
        newChat: {},
        currentChat: {}
      },
      model: {
        newChat: {
          name: '',
          description: '',
          users: [],
          messages: []
        }
      },
      currentMsg: {},
      userQuery: '',
      userHits: []
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      chats: 'chats',
      sortedChats: 'sortedChats',
    }),
    sortedHitUsers() {
      return this.userHits.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    sortedNewChatUsers() {
      const temp = this.newChat.users;
      return temp.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    hasChats() {
      return this.chats.length > 0;
    },
    hasNewChat() {
      return typeof this.newChat !== 'undefined' && this.newChat !== null;
    },
    hasCurrentChat() {
      return typeof this.currentChat !== 'undefined' && !!this.currentChat && this.currentChat.name !== '';
    },
    hasCurrentChatUsers() {
      return typeof this.currentChat.users !== 'undefined' && this.currentChat.users.length > 1;
    }
  },
  beforeCreate() {
    this.$store.dispatch('getChats')
      .then(() => {
        if (this.sortedChats.length > 0) {
          if (this.$route.query.chat) {
            const id = parseInt(this.$route.query.chat);
            const temp = this.sortedChats.find(c => c.id === id);
            if (temp) {
              this.currentChat = temp;
            }
          } else {
            this.currentChat = this.sortedChats[0];
          }
          this.$store.dispatch('getChatUsers', { chat: this.currentChat });
          this.$store.dispatch('getChatMessages', { chat: this.currentChat })
            .then(() => {
              const messages = $('#messages-list')[0];
              this.scrollMessagesToBottom();
            });
        }
      });
  },
  methods: {
    startNewChat() {
      this.setCurrentChatToNew();
      if (!this.newChat || !this.newChat.users) {
        this.newChat = {
          name: 'New Chat',
          users: []
        };
      }
    },
    createChat() {
      if (!this.newChat.users || this.newChat.users.length === 0) {
        return;
      }
      this.newChat.users.unshift(this.user);
      this.newChat.name = this.newChat.users.map(u => u.first_name).join(', ');
      this.$store.dispatch('createChat', { chat: this.newChat, users: this.newChat.users }).then((chat) => {
        this.$socket.emit('new_chat', chat);
        this.setCurrentChat(chat);
        this.resetNewChat();
      });
    },
    removeChat(chat) {
      this.$store.dispatch('removeChat', { chat });
      this.resetCurrentChat();
      this.hideModal("#chat-settings-modal");
    },
    addUserToChat(chat, user, index) {
      this.userHits.splice(index, 1);
      this.$store.dispatch('addChatUser', { chat, user });
    },
    removeUserFromChat(chat, user, index) {
      chat.users.splice(index, 1);
      this.search("userHits", this.userQuery);
      this.$store.dispatch('removeChatUser', { chat, user });
    },
    addUserToNewChat(user, index) {
      this.userHits.splice(index, 1);
      // this.$store.dispatch('addChatUser', { chat, user });
      this.newChat.users.push(user);
    },
    removeUserFromNewChat(user, index) {
      this.newChat.users.splice(index, 1);
      this.search("userHits", this.userQuery);
      // this.$store.dispatch('removeChatUser', { chat, user });
    },
    sendMessage(chat) {
      if (!this.currentMsg[chat.id] || this.currentMsg[chat.id] === '') {
        return;
      }
      const now = moment();
      const message = {
        chat_id: chat.id,
        sender_id: this.$store.getters.user.id,
        sender_first_name: this.$store.getters.user.first_name,
        sender_last_name: this.$store.getters.user.last_name,
        body: this.currentMsg[chat.id],
        time_sent: now,
        new: true
      };
      // Emit message
      this.$socket.emit('new_message', message);
      this.$store.dispatch('sendMessage', { message });
      delete this.currentMsg[chat.id];
    },
    goToProfile(id) {
      this.hideModal('#chat-settings-modal');
      this.$router.push(`/profile/${id}`);
    },
    search(hits, query) {
      if (!query) {
        this[hits] = [];
        return false;
      }
      userIndex.search(query, {
        hitsPerPage: 5
      }, (error, results) => {
        const filteredHits = results.hits.filter(el => this.user.id != el.objectID && !this.newChat.users.some(u => u.id === el.objectID));
        filteredHits.forEach((el) => {
          el.id = el.objectID;
          delete el.objectID;
          delete el._highlightResult;
          return el;
        });
        this[hits] = filteredHits;
      });
    },
    clear(values) {
      values.forEach((v) => {
        const temp = this[v];
        if (Array.isArray(temp)) {
          this[v] = [];
        } else if (typeof temp === 'string' || temp instanceof String) {
          this[v] = '';
        }
      });
      this.resetNewChat();
    },
    handleScroll() {
      this.hasScrolled = true;
    },
    scrollMessagesToBottom() {
      const messages = $('#messages-list')[0];
      if (messages.scrollHeight) {
        messages.scrollTop = messages.scrollHeight;
      }
    },
    onMessageListResize() {
      const messages = $('#messages-list')[0];
      const lastMessage = $('#messages-list .list-group .list-group-item:last-of-type')[0];
      if (this.hasCurrentChat) {;
        if (!this.hasScrolled || messages.scrollHeight - messages.scrollTop - lastMessage.clientHeight === messages.offsetHeight) {
          this.scrollMessagesToBottom();
        }
      }
    },
    formatDate(date) {
      if (!date) {
        return '';
      }
      date = moment(date);
      const now = moment();
      const dayDiff = now.diff(date, 'days');
      const isSameYear = now.isSame(date, 'years');
      if (dayDiff === 0) {
        return date.format('LT');
      } else if (dayDiff === 1) {
        return 'Yesterday, ' + date.format('LT');
      } else if (dayDiff < 7) {
        return date.format('ddd, LT');
      } else if (isSameYear) {
        return date.format('MMM D');
      } else {
        return date.format('LL');
      }
    },
    resetNewChat() {
      this.newChat = null;
      this.isCurrentChatNew = false;
    },
    resetCurrentChat(isNewChat) {
      if (!isNewChat && this.sortedChats.length > 0) {
        this.currentChat = this.sortedChats[0];
        this.isCurrentChatNew = false;
      } else {
        this.currentChat = null;
      }
    },
    setCurrentChat(chat, isNewChat) {
      this.currentChat = chat;
      if (isNewChat) {
        this.setCurrentChatToNew();
        return;
      }
      this.hasScrolled = false;
      this.isCurrentChatNew = false;
      this.$store.dispatch('getChatUsers', { chat: this.currentChat });
      this.$store.dispatch('getChatMessages', { chat: this.currentChat })
        .then(() => {
          this.scrollMessagesToBottom();
        });
    },
    setCurrentChatToNew() {
      this.currentChat = this.newChat;
      this.isCurrentChatNew = true;
      this.hasScrolled = false;
    },
    hasChatUsers(chat) {
      return typeof chat.users !== 'undefined' && chat.users.length > 0;
    },
    hasChatMessages(chat) {
      return typeof chat.messages !== 'undefined' && chat.messages.length > 0;
    },
    hasChatLastSent(chat) {
      return typeof chat.last_time_sent !== 'undefined' && chat.last_time_sent !== null;
    },
    onSubmit(type) {
      console.log(this.formstate.newChat.$valid);
    },
    showModal(modalId) {
      $(modalId).modal('show');
    },
    hideModal(modalId) {
      $(modalId).modal('hide');
    },
    validationStyle
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

#content {
  flex: 1;
}

.list-group-item {
  flex: 1;
  &:first-child {
    // border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  &:last-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

/*
#chats {
  min-width: 400px;
}
*/

#current-chat {
  border-left: 1px solid $grid-border-color;
}

#chats-list,
#messages-list {
  flex: 1;
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;

  .list-group {
    overflow-y: scroll;
  }
}

.subtitle {
  border-bottom: 1px solid $grid-border-color;
}

#message-box {
  height: 50px !important;
  border-top: 1px solid $grid-border-color;

  input {
    border: none;
    width: 100%;
    height: 49px;
  }
}

#messages-list {
  #new-chat-input {
    border: none;
    border-bottom: 1px solid $grid-border-color;
    width: 100%;
    height: 40px;

    #user-search-input {
      border: none;
      height: 100%;
      padding-top: 2px;
      flex: 1;
    }
  }
}

.chat,
.message {
  border-left: 0;
  border-right: 0;
}

.message.message-new {
  animation: bounce 300ms linear both;
}

@keyframes bounce {
  0% { transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  4.7% { transform: matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  9.41% { transform: matrix3d(0.883, 0, 0, 0, 0, 0.883, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  14.11% { transform: matrix3d(1.141, 0, 0, 0, 0, 1.141, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  18.72% { transform: matrix3d(1.212, 0, 0, 0, 0, 1.212, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  24.32% { transform: matrix3d(1.151, 0, 0, 0, 0, 1.151, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  29.93% { transform: matrix3d(1.048, 0, 0, 0, 0, 1.048, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  35.54% { transform: matrix3d(0.979, 0, 0, 0, 0, 0.979, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  41.04% { transform: matrix3d(0.961, 0, 0, 0, 0, 0.961, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  52.15% { transform: matrix3d(0.991, 0, 0, 0, 0, 0.991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  63.26% { transform: matrix3d(1.007, 0, 0, 0, 0, 1.007, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  85.49% { transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
}
</style>
