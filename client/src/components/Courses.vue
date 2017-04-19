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
      .list-group
        .list-group-item.list-group-item-action.course.rounded-0.border(v-for='course in sortedCourses', :key='course.id', v-bind:class='{ active: currentCourse == course }', @click='setCurrentCourse(course)')
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
              button.btn.btn-primary(@click='syncCourses(); hideModal("#sync-course-modal")')
                i.fa.fa-user
                | Login
          small Note: Meetchu does not store your Purdue information.
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { courseIndex } from '../services/algolia';
import { validationStyle } from '../services/form';

const course = {
  id: '8dd62248-6424-4e33-a745-852fdd31c78a',
  title: 'Software Engineering I',
  courseID: 'CS 30700',
  subject: 'CS',
  number: '30700',
  creditHours: 3
};

const user = {
  firstName: 'Jeff',
  lastName: 'Turkstra',
  email: 'test@test.com'
}

const courses = Array(1).fill(course);
const users = Array(5).fill(user);

export default {
  name: 'courses',
  metaInfo: {
    title: 'Courses'
  },
  data() {
    return {
      // courses,
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
  },
  computed: {
    ...mapGetters({
      user: 'user',
      courses: 'courses'
    }),
    sortedCourses() {
      // return this.$store.getters.sortedCourses;
    },
    sortedUsers() {
      return this.users;
    }
  },
  created() {
    console.log('before');
    console.log(this.$store.getters.courses);
    this.$store.dispatch('getCourses', { course })
      .then(() => {
        console.log(this.$store.getters.courses);
      });
  },
  methods: {
    addCourse(course) {
      if (courses.findIndex(c => c.id === course.id) !== -1) {
        console.log(`Course ${c.courseID} has already been added`);
        return false;
      }
      this.$store.dispatch('addCourse', { course });
      // this.courses.push(course);
      this.$root.$emit('hide::modal','add-course-modal');
    },
    setCurrentCourse(course) {
      this.currentCourse = course;
      this.$store.dispatch('getCourseUsers', { course })
        .then((updatedCourse) => {
          this.currentCourse = updatedCourse;
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
        const filteredHits = results.hits.filter(el => this.courses.findIndex(c => c.id === el.objectID) === -1);
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

#courses-list,
#users-list {
  flex: 1;
}

.course {
  border-left: 0;
  border-right: 0;
}
</style>
