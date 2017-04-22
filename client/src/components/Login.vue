<template lang='pug'>
#main.container
  .page-header
    h3 Sign in
  .offset-md-1.col-md-10
    vue-form(:state='formstate', v-model='formstate', @submit.prevent='onSubmit')
      validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.email, false)')
        label.col-md-2.col-form-label Email
        .col-md-10
          input.form-control(type='email', name='email', required, v-model.lazy='model.email')
          field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
            div(slot='required') Please enter your email.
      validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.password, false)')
        label.col-md-2.col-form-label Password
        .col-md-10
          input.form-control(type='password', name='password', required, v-model.lazy='model.password')
          field-messages.form-control-feedback(name='password', show='$touched || $submitted')
            div(slot='required') Please enter your password.
      .py-2.text-center
        button.btn.btn-primary(@click='login()') Login
    .py-2.text-center
      button.btn.btn-block.btn-google.btn-social.offset-md-3.col-md-6(@click='loginAuth("google")')
        i.fa.fa-google-plus
        | Sign in with Google
      button.btn.btn-block.btn-facebook.btn-social.offset-md-3.col-md-6(@click='loginAuth("facebook")')
        i.fa.fa-facebook
        | Sign in with Facebook
  //- pre.
    {{ formstate }}
</template>

<script>
import { default as swal } from 'sweetalert2';
import { validationStyle, resetForm } from '../common/form';

export default {
  name: 'login',
  metaInfo: {
    title: 'Log in'
  },
  data() {
    return {
      formstate: {},
      model: {
        name: '',
        email: '',
        password: ''
      }
    }
  },
  methods: {
    login() {
      if (!this.formstate.$valid) {
        return;
      }
      this.$store.dispatch('login', {
        email: this.model.email,
        password: this.model.password
      }).then(() => {
        console.log('Local login success.');
        // Redirect page
        this.$router.push('/');
        // Alert message
        swal({
          type: 'success',
          title: 'Hurray!',
          text: 'You are now logged in.',
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log('Local login fail.');
        resetForm(this.formstate[type]);
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data,
        })
        .catch(swal.noop);
      })
    },
    loginAuth(provider) {
      this.$store.dispatch('loginOauth', {
        provider
      }).then(() => {
        console.log(`${provider} login success.`);
        // this.$router.push('/');
      }).catch((e) => {
        console.log(`${provider} login fail.`);
        console.log(e);
      })
    },
    onSubmit() {
      console.log(this.formstate.$valid);
    },
    validationStyle
  }
}
</script>

<style lang='scss' scoped>
@import '~bootstrap-social/bootstrap-social.css';
</style>
