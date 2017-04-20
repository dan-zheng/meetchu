<template lang='pug'>
#content.ml-2
  .page-header
    h2 Profile

  .offset-md-1.col-md-10
    .page-header
      h4 Update Profile
    .offset-md-1.col-md-10
      vue-form(:state='formstate.profile', v-model='formstate.profile', @submit.prevent='onSubmit("profile")')
        .form-group.row
          label.col-md-3.col-form-label Name
          .col-md-9
            .row
              validate.col-md-6.required-field(auto-label, :class='validationStyle(formstate.profile.first_name)')
                input.form-control(type='text', name='first_name', placeholder='First', required, v-model.lazy='profile.first_name')
                field-messages.form-control-feedback(auto-label, name='first_name', show='$touched || $submitted')
                  div(slot='required') First name is required.
              validate.col-md-6.required-field(auto-label, :class='validationStyle(formstate.profile.last_name)')
                input.form-control(type='text', name='last_name', placeholder='Last', required, v-model.lazy='profile.last_name')
                field-messages.form-control-feedback(auto-label, name='last_name', show='$touched || $submitted')
                  div(slot='required') Last name is required.
        validate.form-group.row.required-field(auto-label, :class='validationStyle(formstate.profile.email)')
          label.col-md-3.col-form-label Email
          .col-md-9
            input.form-control(type='email', name='email', placeholder='Email', required, v-model.lazy='profile.email')
            field-messages.form-control-feedback(auto-label, name='email', show='$touched || $submitted')
              div(slot='required') Email is required.
              div(slot='email') Email is invalid.
        .py-2.text-center
          button.btn.btn-primary(v-on:click='updateAccount("profile")')
            i.fa.fa-pencil
            | Update
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { validationStyle } from '../common/form';

export default {
  name: 'account',
  metaInfo() {
    return {
      title: typeof this.profile.first_name === 'undefined' ? 'Profile' : `${this.profile.first_name} ${this.profile.last_name}`
    }
  },
  data() {
    return {
      formstate: {
        profile: {},
        password: {}
      },
      profile: {}
    }
  },
  beforeMount() {
    const id = this.$route.params.id;
    this.axios.get(`/profile/${id}`)
      .then((res) => {
        this.profile = Object.assign({}, this.profile, res.data);
        const fullName = `${this.profile.first_name } ${this.profile.last_name}`;
      })
      .catch((err) => {
        throw err;
      });
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
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
