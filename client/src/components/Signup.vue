<template lang='pug'>
.container
  .page-header
    h3 Sign up
  form.form-horizontal(id='signup-form', method='POST')
    .form-group
      label.col-sm-3.control-label(for='firstName') Name
      .col-sm-3
        input.form-control(type='firstName', name='firstName', id='firstName', placeholder='First', autofocus, required)
      .col-sm-3
        input.form-control(type='lastName', name='lastName', id='lastName', placeholder='Last', autofocus, required)
    .form-group
      label.col-sm-3.control-label(for='email') Email
      .col-sm-6
        input.form-control(type='email', name='email', id='email', placeholder='Email', autofocus, required)
    .form-group
      label.col-sm-3.control-label(for='password') Password
      .col-sm-6
        input.form-control(type='password', name='password', id='password', placeholder='Password', required)
    .form-group
      label.col-sm-3.control-label(for='confirmPassword') Confirm Password
      .col-sm-6
        input.form-control(type='password', name='confirmPassword', id='confirmPassword', placeholder='Confirm Password', required)
    .form-group
      .col-sm-offset-3.col-sm-6
        button.btn.btn-success(type='submit')
          i.fa.fa-user-plus
          | Sign up
    input(v-model='msg', placeholder='edit me')
    p Message is {{ msg }}
</template>

<script>
export default {
  name: 'signup',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style lang='scss' scoped>
// @import '../../node_modules/bootstrap-social/bootstrap-social.scss';
</style>
