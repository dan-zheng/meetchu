<template lang='pug'>
.container
  .page-header
    h3 Sign in
  //-
    form.form-horizontal(@submit.prevent='onSubmit')
      .form-group
        label.col-md-3.control-label(for='email') Email
        .col-md-7
          input.form-control(type='email', name='email', id='email', placeholder='Email', autofocus, required)
      .form-group
        label.col-md-3.control-label(for='password') Password
        .col-md-7
          input.form-control(type='password', name='password', id='password', placeholder='Password', required)
      .form-group
        .col-md-offset-3.col-md-7
          button.col-md-3.btn.btn-primary(type='submit')
            i.fa.fa-user
            | Login
          a.btn.btn-link(href='/forgot') Forgot your password?
      .form-group
        .col-md-offset-3.col-md-7
          hr
      .form-group
        .col-md-offset-3.col-md-7
          a.btn.btn-block.btn-google.btn-social(href='/auth/google')
            i.fa.fa-google-plus
            | Sign in with Google
          a.btn.btn-block.btn-facebook.btn-social(href='/auth/facebook')
            i.fa.fa-facebook
            | Sign in with Facebook
  .offset-md-1.col-md-10
    vue-form(:state='formstate', v-model='formstate', @submit.prevent='onSubmit')
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.email)')
        label.col-md-2.col-form-label Email
        .col-md-10
          input.form-control(type='email', name='email', required, v-model.lazy='model.email')
          field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password)')
        label.col-md-2.col-form-label Password
        .col-md-10
          // input.form-control(type='password', name='password', required, minlength='4', v-model.lazy='model.password')
          input.form-control(type='password', name='password', required, v-model.lazy='model.password')
          field-messages.form-control-feedback(name='password', show='$touched || $submitted')
      .py-2.text-center
        button.btn.btn-primary(v-on:click='login()') Login
      .py-2.text-center
        button.btn.btn-block.btn-google.btn-social.offset-md-3.col-md-6(v-on:click='loginAuth("google")')
          i.fa.fa-google-plus
          | Sign in with Google
        button.btn.btn-block.btn-facebook.btn-social.offset-md-3.col-md-6(v-on:click='loginAuth("facebook")')
          i.fa.fa-facebook
          | Sign in with Facebook
    pre.
      {{formstate}}
</template>

<script>
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
      if(!field) {
        return '';
      }
      if((field.$touched || field.$submitted) && field.$valid) {
        return 'has-success';
      }
      if((field.$touched || field.$submitted) && field.$invalid) {
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
        // this.$router.push('/');
      }).catch((e) => {
        console.log('Local login fail.');
        console.log(e);
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
/*
.required-field > label::after {
  content: '*';
  color: red;
  margin-left: 0.25rem;
}
*/
@import '../../node_modules/bootstrap-social/bootstrap-social.css';
</style>
