<template lang='pug'>
#content.d-flex
  #chats.col-md-4.px-0.d-flex.flex-column
    .page-header
      h2.text-center.my-2 Chats
    #chats-list
      b-list-group
        b-list-group-item.chat.rounded-0.border(v-for='chat in chats', :key='chat.name')
          | {{ chat }}
  #messages.col-md-8.px-0.d-flex.flex-column
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
  description: 'A test chat.'
};

const message = {
  sender: 'Dan Zheng',
  text: 'Hello World.'
};

const chats = Array(20).fill(chat);
const messages = Array(20).fill(message);

export default {
  name: 'dashboard',
  metaInfo: {
    title: 'Dashboard'
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
    logout() {
      this.$store.dispatch('logout').then(() => {
        console.log('Logout success.');
        // Redirect page
        this.$router.push('/');
        // Alert message
        swal({
          type: 'success',
          text: 'You have logged out.',
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log('Logout fail.');
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data,
        })
        .catch(swal.noop);
      })
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';
$grid-border-color: rgba($list-group-border-color, .5);

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

#messages {
  border-left: 1px solid $grid-border-color;
}

#chats-list,
#messages-list {
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;
}

#chats-list {
  flex: 1;
}

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
