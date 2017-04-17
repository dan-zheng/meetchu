<template lang='pug'>
#content.d-flex
  #chats.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Chats
      span.d-flex.px-0.ml-auto.align-items-center
        a.fa.fa-lg.fa-plus-square.text-primary(@click='createChat')
        // img(src='static/img/icon-chat.svg', style='height: 45px')
    #chats-list
      b-list-group
        b-list-group-item.chat.rounded-0.border(v-for='chat in chats', :key='chat.name', action)
          // | {{ chat }}
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ chat.name }}
            small {{ chat.lastSent }}
          p.mb-1
            strong {{ chat.lastSender }}:
            |  {{ chat.lastMsg }}
  #messages.d-flex.flex-column.col-sm-8.px-0
    .page-header
      h2.text-center.my-2 Messages
    #messages-list
      b-list-group
        b-list-group-item.message.rounded-0.border(v-for='msg in messages', :key='msg.id')
          | {{ msg }}
    #message-box
      input.px-3(v-model='currentMsg', placeholder='Type message...')
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';

const chat = {
  name: 'Test',
  description: 'A test chat.',
  lastSender: 'Eric Aguilera',
  lastMsg: 'Functional programming is so nice! I love monads.',
  lastSent: '2:09 PM'
};

const message = {
  sender: 'Dan Zheng',
  text: 'Hello World.'
};

const chats = Array(3).fill(chat);
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
      currentMsg: ''
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    createChat() {
      this.chats.push(chat);
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
    border-top: 0;
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

#messages {
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
