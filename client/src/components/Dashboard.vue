<template lang='pug'>
#content.ml-2
  .page-header
    h1 Home
  h3 Hello, {{ user.first_name }}!
  p Your email is {{ user.email }}.
  .btn-group(role='group')
    router-link.btn.btn-primary(to='/account', role='button')
      i.fa.fa-id-card-o
      | Profile
    button.btn.btn-primary(@click='logout')
      i.fa.fa-sign-out
      | Log out
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';

export default {
  name: 'dashboard',
  metaInfo: {
    title: 'Dashboard'
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
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
#content {
  padding: 20px;
}
</style>
