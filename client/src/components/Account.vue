<template lang='pug'>
#content.ml-2
  .page-header
    h1 Profile

  .offset-md-1.col-md-10
    .page-header
      h3 Update Profile
    .offset-md-1.col-md-10
      vue-form(:state='formstate.profile', v-model='formstate.profile', @submit.prevent='onSubmit("profile")')
        .form-group.row
          label.col-md-3.col-form-label Name
          .col-md-9
            .row
              validate.col-md-6.required-field(auto-label, :class='fieldClassName(formstate.profile.firstName)')
                input.form-control(type='text', name='firstName', placeholder='First', required, v-model.lazy='model.profile.firstName')
                field-messages.form-control-feedback(auto-label, name='firstName', show='$touched || $submitted')
                  div(slot='required') First name is required.
              validate.col-md-6.required-field(auto-label, :class='fieldClassName(formstate.profile.lastName)')
                input.form-control(type='text', name='lastName', placeholder='Last', required, v-model.lazy='model.profile.lastName')
                field-messages.form-control-feedback(auto-label, name='lastName', show='$touched || $submitted')
                  div(slot='required') Last name is required.
        validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.profile.email)')
          label.col-md-3.col-form-label Email
          .col-md-9
            input.form-control(type='email', name='email', placeholder='Email', required, v-model.lazy='model.profile.email')
            field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
              div(slot='required') Email is required.
              div(slot='email') Email is invalid.
        .py-2.text-center
          button.btn.btn-primary(v-on:click='updateAccount("profile")')
            i.fa.fa-pencil
            | Update

    .page-header
      h3 Update Password
    .offset-md-1.col-md-10
      vue-form(:state='formstate.password', v-model='formstate.password', @submit.prevent='onSubmit("password")')
        validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password.password)')
          label.col-md-3.col-form-label Password
          .col-md-9
            input.form-control(type='password', name='password', placeholder='Password', required, minlength='4', v-model.lazy='model.password.password')
            field-messages.form-control-feedback(name='password', show='$touched || $submitted')
              div(slot='required') Password is required.
              div(slot='minlength') Password must be at least 4 characters long.
        validate.form-group.row.required-field(auto-label, :class='fieldClassName(formstate.password.confirmPassword)')
          label.col-md-3.col-form-label Confirm Password
          .col-md-9
            input.form-control(type='password', name='confirmPassword', placeholder='Confirm Password', required, minlength='4', :pattern='model.password.password', v-model.lazy='model.password.confirmPassword')
            field-messages.form-control-feedback(name='confirmPassword', show='$touched || $submitted')
              div(slot='pattern') Passwords do not match.
        .py-2.text-center
          button.btn.btn-primary(v-on:click='updateAccount("password")')
            i.fa.fa-lock
            | Change password

    .page-header
      h3 Delete Account
    .offset-md-1.col-md-10
      p You can delete your account, but keep in mind this action is irreversible.
      .py-2.text-center
        button.btn.btn-danger(v-on:click='deleteAccount()')
          i.fa.fa-trash
          | Delete my account
  //- pre.
    {{ formstate }}
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';

export default {
  name: 'account',
  metaInfo: {
    title: 'Account'
  },
  data () {
    return {
      formstate: {
        profile: {},
        password: {}
      },
      model: {
        profile: {
          firstName: '',
          lastName: '',
          email: '',
        },
        password: {
          password: '',
          confirmPassword: ''
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
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
    onSubmit(type) {
      console.log(this.formstate[type].$valid);
    },
    updateAccount(type) {
      if (!this.formstate[type].$valid) {
        return;
      }
      this.$store.dispatch('updateAccount', type, this.model[type]).then(() => {
        console.log(`Update ${type} success.`);
        // Redirect page
        this.$router.push('/');
        // Alert message
        swal({
          type: 'success',
          title: 'Yay!',
          text: 'Your ${type} has been updated.',
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log(`Update ${type} fail.`);
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data
        })
        .catch(swal.noop);
      })
    },
    deleteAccount() {
      this.$store.dispatch('deleteAccount').then(() => {
        console.log(`Account delete success.`);
        // Redirect page
        this.$router.push('/');
        // Alert message
        swal({
          type: 'success',
          title: 'Goodbye!',
          text: 'Your account has been deleted.',
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log(`Account delete fail.`);
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
#content {
  flex: 1;
  padding: 20px;
  overflow-y: scroll;
}
</style>
