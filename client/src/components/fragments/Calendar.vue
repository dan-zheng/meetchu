<template lang='pug'>
#content.d-flex
  #courses.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Meetings
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary.d-flex.align-items-center(@click="$root.$emit('show::modal','add-course-modal')")
          i.fa.fa-lg.fa-plus-square
        a.text-primary(@click='clear(["purdueUsername", "purduePassword"]); showModal("#sync-course-modal");')
          img(src='static/img/icon-purdue.svg', style='height: 18px')
    #courses-list
      .list-group
        .list-group-item.list-group-item-action.course.rounded-0.border(v-for='course in sortedCourses', :key='course.uuid', v-bind:class='{ active: currentCourse == course }', @click='setCurrentCourse(course)')
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ course.subject + ' ' + course.number }}
          p.mb-1
            strong {{ course.title }}
  #current-course.d-flex.flex-column.col-sm-8.px-0(v-model='currentCourse')
    .page-header
      h2.text-center.my-2 {{ currentCourse.subject + ' ' + currentCourse.number }}
    #users-list
      b-list-group
        b-list-group-item.user.rounded-0.border(v-for='user in sortedUsers', :key='user.email')
          | {{ user }}

  //- Modals
  b-modal#add-course-modal(title='Add a course', @shown='clear(["courseHits", "courseQuery"])', hide-footer)
    b-form-input.mb-1(type='text', placeholder='Search for a course...', v-model='courseQuery', @keyup='search("courseHits", courseQuery)')
    .list-group
      .list-group-item.list-group-item-action.rounded-0.border(v-for='course in courseHits', :key='course.objectId', @click='addCourse(course)')
        .d-flex.w-100.mx-1.justify-content-between.align-items-center
          h5.m-0 {{ course.title }}
          small.text-right(style='min-width: 80px;') {{ course.subject + ' ' + course.number }}
  .modal.fade#sync-course-modal(tabindex='-1', role='dialog', aria-labelledby='syncCoursesModalLabel', aria-hidden='true')
    .modal-dialog.modal-md
      .modal-content
        .modal-header
          h5.modal-title Create a chat
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
          p You can enter your Purdue credentials to synchronize your classes.
          vue-form(:state='formstate.purdue', v-model='formstate.purdue', @submit.prevent='onSubmit("purdue")')
            validate.form-group.container(auto-label, :class='validationStyle(formstate.purdue.purdueUsername, false)')
              label.col-form-label Username
              input.form-control(type='text', name='purdueUsername', placeholder='Username', v-model.lazy='purdueUsername', required)
              field-messages.form-control-feedback(name='purdueUsername', show='$touched || $submitted')
                div(slot='required') Username is required.
            validate.form-group.container(auto-label, :class='validationStyle(formstate.purdue.purduePassword, false)')
              label.col-form-label Password
              input.form-control(type='password', name='purduePassword', placeholder='Password', v-model.lazy='purduePassword', required)
              field-messages.form-control-feedback(name='purduePassword', show='$touched || $submitted')
                div(slot='required') Password is required.
            .py-2.text-center
              button.btn.btn-primary(@click='syncCourses(); hideModal("#sync-course-modal");')
                i.fa.fa-user
                | Login
          small Note: Meetchu does not store your Purdue information.
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';

export default {
  name: 'calendar',
  data() {
    return {
      courses,
      users,
      courseQuery: '',
      courseHits: [],
      currentCourse: courses.length > 0 ? courses[0] : null,
      purdueUsername: '',
      purduePassword: '',
      formstate: {
        purdue: {}
      }
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';
</style>
