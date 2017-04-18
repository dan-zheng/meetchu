<template lang='pug'>
#main.container
  .page-header
    h3 Sign up
  .offset-md-1.col-md-10
    vue-form(:state='formstate', v-model='formstate', @submit.prevent='onSubmit')
      .form-group.row
        label.col-md-3.col-form-label Name
        .col-md-9
          .row
            validate.col-md-6.required-field(auto-label, :class='fieldClassName(formstate.firstName)')
              input.form-control(type='text', name='firstName', placeholder='First', required, v-model.lazy='model.firstName')
              field-messages.form-control-feedback(auto-label, name='firstName', show='$touched || $submitted')
                div(slot='required') First name is required.
            validate.col-md-6.required-field(auto-label, :class='fieldClassName(formstate.lastName)')
              input.form-control(type='text', name='lastName', placeholder='Last', required, v-model.lazy='model.lastName')
              field-messages.form-control-feedback(auto-label, name='lastName', show='$touched || $submitted')
                div(slot='required') Last name is required.
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.email)')
        label.col-md-3.col-form-label Email
        .col-md-9
          input.form-control(type='email', name='email', placeholder='Email', required, v-model.lazy='model.email')
          field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
            div(slot='required') Email is required.
            div(slot='email') Email is invalid.
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password)')
        label.col-md-3.col-form-label Password
        .col-md-9
          input.form-control(type='password', name='password', placeholder='Password', required, minlength='4', v-model.lazy='model.password')
          field-messages.form-control-feedback(name='password', show='$touched || $submitted')
            div(slot='required') Password is required.
            div(slot='minlength') Password must be at least 4 characters long.
      validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.confirmPassword)')
        label.col-md-3.col-form-label Confirm Password
        .col-md-9
          input.form-control(type='password', name='confirmPassword', placeholder='Confirm Password', required, minlength='4', :pattern='model.password', v-model.lazy='model.confirmPassword')
          field-messages.form-control-feedback(name='confirmPassword', show='$touched || $submitted')
            div(slot='pattern') Passwords do not match.
      .py-2.text-center
        button.btn.btn-primary(@click='signup()') Submit
  //- pre.
    {{ formstate }}
</template>

<script>
import { default as swal } from 'sweetalert2';

export default {
  name: 'signup',
  metaInfo: {
    title: 'Sign up'
  },
  data() {
    return {
      formstate: {},
      model: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    fieldClassName(field) {
      if (!field) {
        return '';
      }
      if ((field.$touched || field.$submitted) && field.$valid) {
        return 'has-success';
      }
      if ((field.$touched || field.$submitted) && field.$invalid) {
        return 'has-danger';
      }
    },
    onSubmit() {
      console.log(this.formstate.$valid);
    },
    signup() {
      if (!this.formstate.$valid) {
        return;
      }
      this.$store.dispatch('signup', {
        firstName: this.model.firstName,
        lastName: this.model.lastName,
        email: this.model.email,
        password: this.model.password,
        confirmPassword: this.model.confirmPassword,
      }).then(() => {
        console.log('Local signup success.');
        // Redirect page
        this.$router.push('/');
        // Alert message
        swal({
          type: 'success',
          title: 'Yay!',
          text: 'Welcome to Meetchu.',
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log('Local signup fail.');
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data
        })
        .catch(swal.noop);
      })
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
