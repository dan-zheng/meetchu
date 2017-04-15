<template lang='pug'>
.container
  .page-header
    h3 Sign up
  vue-form(:state='formstate', v-model='formstate', @submit.prevent='onSubmit')
    .form-group.row
      label.col-2.col-form-label Name
      validate.col-5.required-field(auto-label, :class='fieldClassName(formstate.firstName)')
        input.form-control(type='text', name='firstName', placeholder='First', required, v-model.lazy='model.firstName')
        field-messages.form-control-feedback(auto-label, name='firstName', show='$touched || $submitted')
          div(slot='required') First name is required.
      validate.col-5.required-field(auto-label, :class='fieldClassName(formstate.lastName)')
        input.form-control(type='text', name='lastName', placeholder='Last', required, v-model.lazy='model.lastName')
        field-messages.form-control-feedback(auto-label, name='lastName', show='$touched || $submitted')
          div(slot='required') Last name is required.
    validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.email)')
      label.col-2.col-form-label Email
      .col-10
        input.form-control(type='email', name='email', placeholder='Email', required, v-model.lazy='model.email')
        field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
          div(slot='required') Email is required.
          div(slot='email') Email is invalid
    validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password)')
      label.col-2.col-form-label Password
      .col-10
        input.form-control(type='password', name='password', placeholder='Password', required, minlength='4', v-model.lazy='model.password')
        field-messages.form-control-feedback(name='password', show='$touched || $submitted')
          div(slot='required') Password is required.
          div(slot='minlength') Password must be at least 4 characters long.
    validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.confirmPassword)')
      label.col-2.col-form-label Confirm Password
      .col-10
        input.form-control(type='password', name='confirmPassword', placeholder='Confirm Password', required, minlength='4', :pattern='model.password', v-model.lazy='model.confirmPassword')
        field-messages.form-control-feedback(name='confirmPassword', show='$touched || $submitted')
          div(slot='pattern') Passwords do not match.
    .py-2.text-center
      button.btn.btn-primary(v-on:click='signup()') Submit
  pre.
    {{ formstate }}
</template>

<script>
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
      this.$store.dispatch('signup', {
        firstName: this.model.firstName,
        lastName: this.model.lastName,
        email: this.model.email,
        password: this.model.password
      }).then(() => {
        console.log('Local login success.');
        // this.$router.push('/');
      }).catch((e) => {
        console.log('Local login fail.');
        console.log(e);
      })
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
