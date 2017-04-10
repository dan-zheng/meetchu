<template lang='pug'>
.container
  .page-header
    h3 Sign in
  form.form-horizontal(method='POST')
    .form-group
      label.col-sm-3.control-label(for='email') Email
      .col-sm-7
        input.form-control(type='email', name='email', id='email', placeholder='Email', autofocus, required)
    .form-group
      label.col-sm-3.control-label(for='password') Password
      .col-sm-7
        input.form-control(type='password', name='password', id='password', placeholder='Password', required)
    .form-group
      .col-sm-offset-3.col-sm-7
        button.col-sm-3.btn.btn-primary(@click='login', type='submit')
          i.fa.fa-user
          | Login
        a.btn.btn-link(href='/forgot') Forgot your password?
    .form-group
      .col-sm-offset-3.col-sm-7
        hr
    .form-group
      .col-sm-offset-3.col-sm-7
        a.btn.btn-block.btn-google.btn-social(href='/auth/google')
          i.fa.fa-google-plus
          | Sign in with Google
        a.btn.btn-block.btn-facebook.btn-social(href='/auth/facebook')
          i.fa.fa-facebook
          | Sign in with Facebook
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'login',
  computed: {
    ...mapGetters({
      thread: 'currentThread',
      messages: 'currentMessages'
    })
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    login() {
      this.$store.dispatch('login', {
        username: 'John',
        password: 'asdf'
      }).then(() => {
        console.log('success');
      }).catch((e) => {
        console.log('ERROR');
        console.log(e);
      })
    }
  }
}
</script>

<style lang='scss' scoped>
@import '../../node_modules/bootstrap-social/bootstrap-social.css';
</style>
