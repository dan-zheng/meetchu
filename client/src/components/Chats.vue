<template lang='pug'>
#content.d-flex
  #chats.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Chats
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary(@click="$root.$emit('show::modal','new-chat-modal')")
          i.fa.fa-lg.fa-plus-square
        // img(src='static/img/icon-chat.svg', style='height: 45px')
    #chats-list
      .list-group
        .list-group-item.list-group-item-action.chat.rounded-0.border(v-for='chat in chats', :key='chat.name', v-bind:class='{ active: currentChat == chat }', @click='setCurrentChat(chat)')
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ chat.name }}
            small {{ chat.lastSent }}
          p.mb-1
            strong {{ chat.lastSender }}:
            |  {{ chat.lastMsg }}
  #current-chat.d-flex.flex-column.col-sm-8.px-0(v-model='currentChat')
    .page-header
      h2.text-center.my-2 {{ currentChat.name }}
    #messages-list
      b-list-group
        b-list-group-item.message.rounded-0.border(v-for='msg in messages', :key='msg.id')
          | {{ msg }}
    #message-box
      input.px-3(v-model='currentMsg', placeholder='Type message...')
  b-modal#new-chat-modal(title='Create a chat', @shown='clear("userHits", "userQuery")', @ok='createChat(model.newChat)')
    vue-form(:state='formstate.newChat', v-model='formstate.newChat', @submit.prevent='createChat')
    b-form-input.mb-1(type='text', placeholder='Chat name', v-model='model.newChat.title')
    b-form-input.mb-1(type='text', placeholder='Description', v-model='model.newChat.description')
    b-form-input.mb-1(type='text', placeholder='Search for a user...', v-model='userQuery', @keyup='search("userHits", userQuery)')
    .list-group
      .list-group-item.list-group-item-action.rounded-0.border(v-for='user in userHits', :key='user.objectId', @click='addUser(model.newChat, user)')
        .d-flex.w-100.mx-1.justify-content-between.align-items-center
          h5.m-0 {{ user.firstName + ' ' + user.lastName }}
          small.text-right(style='min-width: 80px;') {{ user.email }}
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { userIndex } from '../services/algolia';

const chat = {
  name: 'Test',
  description: 'A test chat.',
  lastSender: 'Eric Aguilera',
  lastMsg: 'Functional programming is so nice! I love monads.',
  lastSent: '2:09 PM',
  users: []
};

const message = {
  sender: 'Dan Zheng',
  text: 'Hello World.'
};

const chats = Array(1).fill(chat);
const messages = Array(20).fill(message);

export default {
  name: 'chats',
  metaInfo: {
    title: 'Chats'
  },
  data () {
    return {
      chats,
      messages,
      currentChat: chats.length > 0 ? chats[0] : null,
      formstate: {
        newChat: {}
      },
      model: {
        newChat: {
          title: '',
          description: '',
          users: []
        }
      },
      currentMsg: '',
      userQuery: '',
      userHits: []
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    }),
    sortedUsers(chat) {
      return chat.users.sort((a, b) => {
        const u1 = a.first_name + ' ' + a.last_name;
        const u2 = b.first_name + ' ' + b.last_name;
        return u1.localeCompare(u2);
      });;
    }
  },
  methods: {
    createChat() {
      if (!this.formstate.$valid) {
        return;
      }
      this.chats.push(newChat);
      this.$root.$emit('hide::modal','new-chat-modal');
    },
    addChat(chat, user) {
      this.chat.users.push(user);
    },
    search(hits, query) {
      if (!query) {
        this[hits] = [];
        return false;
      }
      userIndex.search(query, {
        hitsPerPage: 5
      }, (error, results) => {
        this[hits] = results.hits;
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
    },
    setCurrentChat(chat) {
      this.currentChat = chat;
    }
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
