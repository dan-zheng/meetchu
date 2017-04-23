<template lang='pug'>
#content.ml-2
  h2 User Profile
  hr
  div(v-if='isProfileLoaded')
    h3 {{ fullName }}
    h5 Email:
      span(v-if='profile.privacy_show_email && profile.email')  {{ profile.email }}
      i.text-muted(v-else-if='profile.privacy_show_email && !profile.email')  unspecificied
      i.text-muted(v-else)  private
    h5 Major:
      span(v-if='profile.privacy_show_major && profile.major')  {{ profile.major }}
      i.text-muted(v-else-if='profile.privacy_show_major && !profile.major')  unspecificied
      i.text-muted(v-else)  private
    button.btn.btn-primary(@click='createChat')
      i.fa.fa-comments-o
      | Start a chat
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { validationStyle } from '../common/form';

export default {
  name: 'account',
  metaInfo() {
    return {
      title: typeof this.profile.first_name === 'undefined' ? 'Profile' : `${this.profile.first_name} ${this.profile.last_name}`
    }
  },
  data() {
    return {
      profile: {}
    }
  },
  beforeCreate() {
    const id = this.$route.params.id;
    this.axios.get(`/profile/${id}`)
      .then((res) => {
        this.profile = Object.assign({}, this.profile, res.data);
        console.log(this.profile);
      })
      .catch((err) => {
        throw err;
      });
  },
  computed: {
    ...mapGetters({
      user: 'user'
    }),
    fullName() {
      return `${this.profile.first_name } ${this.profile.last_name}`;
    },
    isProfileLoaded() {
      return typeof this.profile.id !== 'undefined';
    }
  },
  methods: {
    createChat() {
      // TODO: Add method for starting a 2-person chat
      if (this.profile.id === this.user.id) {
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: 'You can\'t make a chat with yourself. Try someone else!'
        })
        .catch(swal.noop);
        return;
      }
      const chat = {
        name: `${this.user.first_name}, ${this.profile.first_name}`
      };
      this.$store.dispatch('createChat', { chat, users: [this.user, this.profile] }).then((chat) => {
        this.$router.push({ path: '/chats' });
        swal({
          type: 'success',
          title: 'Woohoo!',
          text: `You've started a chat with ${this.fullName}.`
        })
        .catch(swal.noop);
      });
    },
    onSubmit(type) {
      console.log(this.formstate[type].$valid);
    },
    validationStyle
  }
}
</script>

<style lang='scss' scoped>
#content {
  flex: 1;
  padding: 20px;
  overflow-y: scroll;
}
</style>
