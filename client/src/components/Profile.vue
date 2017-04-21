<template lang='pug'>
#content.ml-2
  div(v-if='isProfileLoaded')
    h2 {{ fullName }}

    h5 Email:
      span(v-if='profile.email')  {{ profile.email }}
      i(v-else)  private
    h5 Major:
      span(v-if='profile.major')  {{ profile.major }}
      i(v-else)  private
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
      this.$router.push({ path: '/chats' });
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
