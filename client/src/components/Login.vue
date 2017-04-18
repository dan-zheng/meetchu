<template lang='pug'>
#main.container
  .page-header
    h3 Sign in
  .offset-md-1.col-md-10
    vue-form(:state='formstate', v-model='formstate', @submit.prevent='onSubmit')
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.email)')
        label.col-md-2.col-form-label Email
        .col-md-10
          input.form-control(type='email', name='email', required, v-model.lazy='model.email')
          field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
            div(slot='required') Please enter your email.
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password)')
        label.col-md-2.col-form-label Password
        .col-md-10
          // input.form-control(type='password', name='password', required, minlength='4', v-model.lazy='model.password')
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
    fieldClassName(field) {
      if (!field) {
        return '';
      }
      if ((field.$touched || field.$submitted) && field.$valid) {
        return '';
        // return 'has-success';
      }
      if ((field.$touched || field.$submitted) && field.$invalid) {
        return 'has-danger';
      }
    },
    onSubmit() {
      console.log(this.formstate.$valid);
    },
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
        console.log(e);
        console.log('Local login fail.');
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
      this.$store.dispatch('loginAuth', {
        provider
      }).then(() => {
        console.log(`${provider} login success.`);
        // this.$router.push('/');
      }).catch((e) => {
        console.log(`${provider} login fail.`);
        console.log(e);
      })
    }
  }
}
</script>

<style lang='scss' scoped>
@import '~bootstrap-social/bootstrap-social.css';
</style>
