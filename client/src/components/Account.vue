<template lang='pug'>
#content.ml-2
  .page-header
    h2 Account

  .offset-md-1.col-md-10
    .mt-2
      h4 Update Profile
    .offset-md-1.col-md-10
      vue-form(:state='formstate.profile', v-model='formstate.profile', @submit.prevent='onSubmit("profile")')
        .form-group.row
          label.col-md-3.col-form-label Name
          .col-md-9
            .row
              validate.col-md-6.required-field(auto-label, :class='validationStyle(formstate.profile.first_name)')
                input.form-control(type='text', name='first_name', placeholder='First', required, v-model.lazy='userModel.first_name')
                field-messages.form-control-feedback(auto-label, name='first_name', show='$touched || $submitted')
                  div(slot='required') First name is required.
              validate.col-md-6.required-field(auto-label, :class='validationStyle(formstate.profile.last_name)')
                input.form-control(type='text', name='last_name', placeholder='Last', required, v-model.lazy='userModel.last_name')
                field-messages.form-control-feedback(auto-label, name='last_name', show='$touched || $submitted')
                  div(slot='required') Last name is required.
        validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.profile.email)')
          label.col-md-3.col-form-label Email
          .col-md-9
            input.form-control(type='email', name='email', placeholder='Email', required, v-model.lazy='userModel.email')
            field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
              div(slot='required') Email is required.
              div(slot='email') Email is invalid.
        validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.profile.major)')
          label.col-md-3.col-form-label Major
          .col-md-9
            input.form-control(type='text', name='major', placeholder='Major', v-model.lazy='userModel.major')
            field-messages.form-control-feedback(auto-label, name='major', show='$touched || $submitted')
        .py-2.text-center
          button.btn.btn-primary(@click='updateAccount("profile")')
            i.fa.fa-pencil
            | Update
    hr
    .mt-2
      h4 Privacy Settings
    .offset-md-1.col-md-10
      .form-group.row
        label.col-md-5.col-form-label Show Email
        .col-md-5.text-center
          b-form-checkbox(v-model.lazy='userModel.privacy_show_email', value='1', unchecked-value='0')
      .form-group.row
        label.col-md-5.col-form-label Show Major
        .col-md-5.text-center
          b-form-checkbox(v-model.lazy='userModel.privacy_show_major', value='1', unchecked-value='0')
      .form-group.row
        label.col-md-5.col-form-label Show Profile Picture
        .col-md-5.text-center
          b-form-checkbox(v-model.lazy='userModel.privacy_show_profile_picture_url', value='1', unchecked-value='0')
    .py-2.text-center
      button.btn.btn-primary(@click='updateAccount("privacy")')
        i.fa.fa-pencil
        | Update
    hr
    .mt-2
      h4 Update Password
    .offset-md-1.col-md-10
      vue-form(:state='formstate.password', v-model='formstate.password', @submit.prevent='onSubmit("password")')
        validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.password.password)')
          label.col-md-3.col-form-label Password
          .col-md-9
            input.form-control(type='password', name='password', placeholder='Password', required, minlength='4', v-model.lazy='userModel.password')
            field-messages.form-control-feedback(name='password', show='$touched || $submitted')
              div(slot='required') Password is required.
              div(slot='minlength') Password must be at least 4 characters long.
        validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.password.confirm_password)')
          label.col-md-3.col-form-label Confirm Password
          .col-md-9
            input.form-control(type='password', name='confirm_password', placeholder='Confirm Password', required, minlength='4', :pattern='userModel.password', v-model.lazy='userModel.confirm_password')
            field-messages.form-control-feedback(name='confirm_password', show='$touched || $submitted')
              div(slot='pattern') Passwords do not match.
        .py-2.text-center
          button.btn.btn-primary(@click='updateAccount("password")')
            i.fa.fa-lock
            | Change password
    hr
    .mt-2
      h4 Delete Account
    .offset-md-1.col-md-10
      p You can delete your account, but keep in mind this action is irreversible.
      .py-2.text-center
        button.btn.btn-danger(@click='deleteAccount()')
          i.fa.fa-trash
          | Delete my account
  //- pre.
    {{ formstate }}
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { validationStyle, resetForm } from '../common/form';

const fields = {
  profile: ['first_name', 'last_name', 'email', 'major'],
  privacy: ['privacy_show_email', 'privacy_show_major', 'privacy_show_profile_picture_url'],
  password: ['password']
};

export default {
  name: 'account',
  metaInfo: {
    title: 'Account'
  },
  data() {
    return {
      formstate: {
        profile: {},
        password: {}
      },
      userModel: {
        first_name: null,
        last_name: null,
        email: null,
        major: null,
        privacy_show_email: null,
        privacy_show_major: null,
        privacy_show_profile_picture_url: null,
      }
    }
  },
  created() {
    this.userModel = Object.assign({}, this.$store.getters.user);
    delete this.userModel.password;
    delete this.userModel.confirm_password;
    fields.privacy.forEach((field) => {
      this.userModel[field] = this.userModel[field].toString();
      // TODO: Fix privacy settings
      // console.log(this.userModel[field] + ': ' + typeof this.userModel[field]);
    })
    // resetForm(this.formstate.password);
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    updateAccount(type) {
      if (type !== 'privacy' && !this.formstate[type].$valid) {
        return;
      }
      this.$store.dispatch('updateAccount', {
        user: this.userModel,
        fields: fields[type]
      }).then(() => {
        console.log(`Update ${type} success.`);
        this.clearForm(type);
        const alertText = type === 'privacy' ? `Your ${type} settings have been updated.` : `Your ${type} has been updated.`;
        // Alert message
        swal({
          type: 'success',
          title: 'Yay!',
          text: alertText,
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log(`Update ${type} fail.`);
        this.clearForm(type);
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data
        })
        .catch(swal.noop);
      });
    },
    deleteAccount() {
      this.$store.dispatch('deleteAccount', {
        user: this.userModel
      }).then(() => {
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
    },
    clearForm(type) {
      // TODO: Fix clear form
      if (type === 'privacy') {
        return;
      }
      if (type === 'password') {
        this.userModel.password = '';
        this.userModel.confirmPassword = '';
      }
      resetForm(this.formstate[type]);
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
