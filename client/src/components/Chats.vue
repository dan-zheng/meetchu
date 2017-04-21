<template lang='pug'>
#content.d-flex
  #chats.d-flex.flex-column.col-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Chats
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary(@click='clear(["userHits", "userQuery"]); showModal("#new-chat-modal");')
          i.fa.fa-lg.fa-plus-square
    #chats-list
      p.text-muted.px-3.py-2.my-0(v-if='!hasChats') You are not in any chats.
      .list-group(v-else)
        .list-group-item.list-group-item-action.chat.rounded-0.border(v-for='chat in sortedChats', :key='chat.name', :class='{ active: currentChat == chat }', @click='setCurrentChat(chat)')
          //- TODO: Need to refactor
          .list-group-item.p-0.border-0(v-if='hasChatLastSent(chat)', style='background-color: transparent;')
            .d-flex.w-100.justify-content-between.flex-wrap
              h5.mb-1 {{ chat.name }}
              small {{ formatDate(chat.time_sent) }}
            p.mb-1(v-if='hasChatLastSent(chat)')
              strong {{ chat.first_name + ' ' + chat.last_name }}:
              |  {{ chat.body }}
          .d-flex.w-100.justify-content-between.flex-wrap(v-else)
            h5.word-wrap.mb-1 {{ chat.name }}
  #current-chat.d-flex.flex-column.col-8.px-0(v-model='currentChat')
    .d-flex.text-center.px-4.align-items-stretch(v-if='hasCurrentChat')
      span.ml-auto
      h2.my-2(style='min-height: 35px') {{ currentChat.name }}
      span.d-flex.px-0.ml-auto.align-items-center
        a.ml-auto(@click='showModal("#chat-settings-modal")')
          i.fa.fa-lg.fa-cog
    .d-flex.text-center.px-4.align-items-center(v-else)
      h2.mx-auto.my-2(style='min-height: 35px') Chat Info
    #messages-list
      p.text-muted.px-3.py-2.my-0(v-if='!hasChats') Create a chat to start messaging!
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasCurrentChat') Click on a chat!
      //- p.text-muted.px-3.py-2.my-0(v-else-if='!hasCurrentChatUsers') Add another user to start chatting!
      p.text-muted.px-3.py-2.my-0(v-else-if='!hasChatMessages(currentChat)') Send a message!
      div(v-else)
        // h4.subtitle.px-2.py-2.my-0 Messages
        .list-group(v-if='hasCurrentChat')
          .list-group-item.message.rounded-0.border(v-for='msg in currentChat.messages', :key='msg.id')
            | {{ msg }}
    #message-box(v-if='hasCurrentChat')
      input.px-3(v-model='currentMsg[currentChat.id]', placeholder='Type message...', @keyup.enter='sendMessage(currentChat)')
      //-
        input.px-3(v-if='hasCurrentChatUsers', v-model='currentMsg[currentChat.id]', placeholder='Type message...', @keyup.enter='sendMessage(currentChat)')
        input.px-3(v-else, v-model='currentMsg[currentChat.id]', placeholder='Add another user to chat!', disabled)

  //- Modals
  .modal.fade#new-chat-modal(tabindex='-1', role='dialog', aria-labelledby='newChatModalLabel', aria-hidden='true')
    .modal-dialog.modal-md
      .modal-content
        .modal-header
          h5.modal-title Create a chat
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
          vue-form(:state='formstate.newChat', v-model='formstate.newChat', @submit.prevent='onSubmit')
            validate.form-group.container(auto-label, :class='validationStyle(formstate.newChat.chatName)')
              label.col-form-label Chat name
              input.form-control(type='text', name='chatName', placeholder='Chat name', v-model.lazy='model.newChat.name', required)
              field-messages.form-control-feedback(name='chatName', show='$touched || $submitted')
                div(slot='required') Chat name is required.
            .form-group.container
              label.col-form-label Description
              input.form-control(type='text', name='description', placeholder='Description', v-model.lazy='model.newChat.description')
            .form-group.container
              label.col-form-label Add users
              input.form-control(type='text', placeholder='Search for a user...', v-model='userQuery', @keyup='search("userHits", userQuery)')
            small.text-info(v-if='userHits.length > 0') Matches
            small.text-warning(v-else-if='userQuery.length > 0 && typeof model.newChat !== "undefined"') No matches.
            .list-group
              .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedHitUsers', :key='user.objectId', @click='addUserToChat(model.newChat, user, index)')
                .d-flex.w-100.mx-1.justify-content-between.align-items-center
                  h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                  small.text-right(style='min-width: 80px;') {{ user.email }}
            small.text-success(v-if='model.newChat.users.length > 0') Selected
            .list-group
              .list-group-item.list-group-item-action.rounded-0.border(v-for='(user, index) in sortedNewChatUsers', :key='user.id', @click='removeUserFromChat(model.newChat, user, index)')
                .d-flex.w-100.mx-1.justify-content-between.align-items-center
                  i.fa.fa-check.text-success
                  h5.m-0 {{ user.first_name + ' ' + user.last_name }}
                  small.text-right(style='min-width: 80px;') {{ user.email }}
            .py-2.text-center
              button.btn.btn-primary(v-on:click='createChat(model.newChat)')
                i.fa.fa-plus-circle
                | Create chat

  .modal.fade#chat-settings-modal(tabindex='-1', role='dialog', aria-labelledby='chatSettingsModalLabel', aria-hidden='true')
    .modal-dialog.modal-md
      .modal-content
        .modal-header
          h5.modal-title Chat settings
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import { default as swal } from 'sweetalert2';
import { userIndex } from '../common/algolia';
import { validationStyle } from '../common/form';

export default {
  name: 'chats',
  metaInfo: {
    title: 'Chats'
  },
  data() {
    return {
      currentChat: {},
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
      const temp = this.model.newChat.users
      return temp.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });
    },
    hasChats() {
      return this.chats.length > 0;
    },
    hasCurrentChat() {
      return typeof this.currentChat.name !== 'undefined';
    },
    hasCurrentChatUsers() {
      return typeof this.currentChat.users !== 'undefined' && this.currentChat.users.length > 1;
    }
  },
  beforeMount() {
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
          this.$store.dispatch('getChatMessages', { chat: this.currentChat });
        }
      });
  },
  methods: {
    createChat() {
      if (!this.formstate.newChat.$valid) {
        return;
      }
      this.hideModal("#new-chat-modal");
      this.$store.dispatch('createChat', { chat: this.model.newChat });
      this.model.newChat.users.forEach((user) => {
        this.$store.dispatch('addChatUser', { chat: this.model.newChat, user });
      });
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
    setCurrentChat(chat) {
      this.currentChat = chat;
      // console.log(chat);
      if (chat.users && chat.users.length > 0) {
        this.$store.dispatch('getChatUsers', { chat: this.currentChat });
        this.$store.dispatch('getChatMessages', { chat: this.currentChat });
      }
    },
    sendMessage(chat) {
      const now = moment();
      const message = {
        chat_id: chat.id,
        sender_id: this.$store.getters.user.id,
        sender_first_name: this.$store.getters.user.first_name,
        sender_last_name: this.$store.getters.user.last_name,
        body: this.currentMsg[chat.id],
        time_sent: now
      };
      // Emit message
      this.$socket.emit('send_message', message);
      this.$store.dispatch('sendMessage', { message });
      delete this.currentMsg[chat.id];
    },
    search(hits, query) {
      if (!query) {
        this[hits] = [];
        return false;
      }
      userIndex.search(query, {
        hitsPerPage: 5
      }, (error, results) => {
        const filteredHits = results.hits.filter(el => this.model.newChat.users.findIndex(u => u.id === el.objectID) === -1);
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
      this.model.newChat = {
        name: '',
        description: '',
        users: [],
        messages: []
      };
    },
    hasChatUsers(chat) {
      return typeof chat.users !== 'undefined' && chat.users.length > 0;
    },
    hasChatMessages(chat) {
      return typeof chat.messages !== 'undefined' && chat.messages.length > 0;
    },
    hasChatLastSent(chat) {
      return typeof chat.time_sent !== 'undefined' && chat.time_sent !== null;
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
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;
}

.subtitle {
  border-bottom: 1px solid $grid-border-color;
}

#chats-list,
#messages-list {
  flex: 1;
}

#message-box {
  height: 50px !important;
  border-top: 1px solid $grid-border-color;

  input {
    border: none;
    width: 100%;
    height: 100%;
  }
}

.chat,
.message {
  border-left: 0;
  border-right: 0;
}
</style>
