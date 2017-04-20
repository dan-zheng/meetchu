<template lang='pug'>
#content.d-flex
  #courses.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Courses
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary.d-flex.align-items-center(@click="$root.$emit('show::modal','add-course-modal')")
          i.fa.fa-lg.fa-plus-square
        a.text-primary(@click='clear(["purdueUsername", "purduePassword"]); showModal("#sync-course-modal");')
          img(src='static/img/icon-purdue.svg', style='height: 18px')
    #courses-list
      p.text-muted.px-4.py-2.my-0(v-if='!hasCourses') You are not in any courses.
      .list-group(v-else)
        .list-group-item.list-group-item-action.course.rounded-0.border(v-for='course in sortedCourses', :key='course.id', v-bind:class='{ active: currentCourse == course }', @click='setCurrentCourse(course)')
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ course.subject + ' ' + course.number }}
          p.mb-1
            strong {{ course.title }}
  #current-course.d-flex.flex-column.col-sm-8.px-0(v-model='currentCourse')
    .d-flex.px-4.align-items-stretch(v-if='hasCurrentCourse')
      span.ml-auto
      h2.my-2(style='min-height: 35px') {{ currentCourse.subject + ' ' + currentCourse.number }}
      span.d-flex.px-0.ml-auto.align-items-center
        a.ml-auto(@click='showModal("#course-settings-modal")')
          i.fa.fa-lg.fa-cog
    .d-flex.px-4.align-items-center(v-else)
      h2.mx-auto.my-2(style='min-height: 35px') Course Info
    #users-list
      p.text-muted.px-4.py-2.my-0(v-if='!hasCourses') Add a course to see course information!
      p.text-muted.px-4.py-2.my-0(v-else-if='!hasCurrentCourse') Click on a course to see course information!
      h4.subtitle.px-2.py-2.my-0(v-else) Students
        span(v-if='hasCurrentCourseUsers')  ({{ currentCourse.users.length }})
      .list-group(v-if='hasCurrentCourse')
        .list-group-item.list-group-item-action.user.rounded-0.border(v-for='user in currentCourse.users', :key='user.email')
          .d-flex.w-100.mx-1.justify-content-between.align-items-center
            h5.mb-0 {{ user.first_name + ' ' + user.last_name }}
            small.text-right {{ user.email }}

  //- Modals
  b-modal#add-course-modal(title='Add a course', @shown='clear(["courseHits", "courseQuery"])', size='lg', hide-footer)
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
          h5.modal-title Sync Purdue courses
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
              button.btn.btn-primary(@click='syncCourses(); hideModal("#sync-course-modal")')
                i.fa.fa-user
                | Login
          small Note: Meetchu does not store your Purdue information.
  .modal.fade#course-settings-modal(tabindex='-1', role='dialog', aria-labelledby='courseSettingsModalLabel', aria-hidden='true')
    .modal-dialog.modal-md
      .modal-content
        .modal-header
          h5.modal-title Course Settings: {{ currentCourse.subject + ' ' + currentCourse.number }}
          button.close(type='button', data-dismiss='modal', aria-label='Close')
            span(aria-hidden='true') ×
        .modal-body
          .py-2.text-center
            button.btn.btn-danger(v-on:click='removeCourse(currentCourse); hideModal("#course-settings-modal");')
              i.fa.fa-trash
              | Remove this course
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { courseIndex } from '../services/algolia';
import { validationStyle } from '../services/form';

export default {
  name: 'courses',
  metaInfo: {
    title: 'Courses'
  },
  data() {
    return {
      courseQuery: '',
      courseHits: [],
      currentCourse: {},
      purdueUsername: '',
      purduePassword: '',
      formstate: {
        purdue: {}
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      courses: 'courses',
      sortedCourses: 'sortedCourses'
    }),
    hasCourses() {
      return this.courses.length > 0;
    },
    hasCurrentCourse() {
      return typeof this.currentCourse.id !== 'undefined';
    },
    hasCurrentCourseUsers() {
      return typeof this.currentCourse.users !== 'undefined' && this.currentCourse.users.length > 0;
    }
  },
  beforeMount() {
    this.$store.dispatch('getCourses')
      .then(() => {
        if (this.sortedCourses.length > 0) {
          this.currentCourse = this.sortedCourses[0];
          this.$store.dispatch('getCourseUsers', { course: this.currentCourse });
        }
      });
  },
  methods: {
    addCourse(course) {
      if (this.courses.findIndex(c => c.id === course.id) !== -1) {
        console.log(`Course ${c.id} has already been added`);
        return false;
      }
      this.$store.dispatch('addCourse', { course });
      this.$root.$emit('hide::modal','add-course-modal');
    },
    removeCourse(course) {
      this.$store.dispatch('removeCourse', { course });
      this.currentCourse = {};
      this.$root.$emit('hide::modal','course-settings-modal');
    },
    setCurrentCourse(course) {
      this.currentCourse = course;
      this.$store.dispatch('getCourseUsers', { course })
        .then(() => {
          this.currentCourse = this.sortedCourses.find(c => c.id === course.id);
        }).catch((e) => {
          console.log('Get course users failed.');
        });
    },
    syncCourses() {
      if (!this.formstate.purdue.$valid) {
        return;
      }
      this.clear(["courseHits", "courseQuery"]);
      this.$store.dispatch('syncCourses', {
        username: this.purdueUsername,
        password: this.purduePassword
      }).then(() => {
        console.log(`Sync courses success.`);
        // Alert message
        swal({
          type: 'success',
          title: 'Woo!',
          text: `Your Purdue courses have been added.`,
        })
        .catch(swal.noop);
      }).catch((e) => {
        console.log(`Sync courses fail.`);
        // Alert message
        swal({
          type: 'error',
          title: 'Oops.',
          text: e.response.data
        })
        .catch(swal.noop);
      });
    },
    search(hits, query) {
      if (!query) {
        this[hits] = [];
        return false;
      }
      courseIndex.search(query, {
        hitsPerPage: 5
      }, (error, results) => {
        const filteredHits = results.hits.filter(el => this.sortedCourses.findIndex(c => c.id === el.objectID) === -1);
        filteredHits.forEach((el) => {
          el.id = el.objectID;
          delete el.objectID;
          delete el._highlightResult;
          return el;
        });
        this[hits] = filteredHits;
      });
    },
    clear(values) {
      values.forEach((v) => {
        const temp = this[v];
        if (Array.isArray(temp)) {
          this[v] = [];
        } else if (typeof temp === 'string' || temp instanceof String) {
          this[v] = '';
        }
      });
    },
    onSubmit() {
      console.log(this.formstate.purdue.$valid);
    },
    showModal(modalId) {
      $(modalId).modal('show');
    },
    hideModal(modalId) {
      $(modalId).modal('hide');
    },
    validationStyle
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

#content {
  flex: 1;
}

.list-group-item {
  flex: 1;
  &:first-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  &:last-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

#current-course {
  border-left: 1px solid $grid-border-color;
}

#courses-list,
#users-list {
  border-top: 1px solid $grid-border-color;
  border-radius: 0;
  overflow-y: scroll;
}

.subtitle {
  border-bottom: 1px solid $grid-border-color;
}

#courses-list,
#users-list {
  flex: 1;
}

.course,
.user {
  border-left: 0;
  border-right: 0;
}
</style>
