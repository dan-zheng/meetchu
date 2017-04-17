<template lang='pug'>
#content.d-flex
  #courses.d-flex.flex-column.col-sm-4.px-0
    .d-flex.text-center.px-4.align-items-stretch
      h2.my-2 Courses
      span.d-flex.px-0.ml-auto.align-items-center
        a.text-primary(@click="$root.$emit('show::modal','modal1')")
          i.fa.fa-lg.fa-plus-square
        // input(type='text', v-model='courseQuery', @keyup='search')
        // img(src='static/img/icon-course.svg', style='height: 45px')
    #courses-list
      .list-group
        .list-group-item.list-group-item-action.course.rounded-0.border(v-for='course in courses', :key='course.uuid', v-bind:class='{ active: currentCourse == course }', @click='setCurrentCourse(course, $event)')
          .d-flex.w-100.justify-content-between
            h5.mb-1 {{ course.subject + ' ' + course.number }}
          p.mb-1
            strong {{ course.title }}
  #current-course.d-flex.flex-column.col-sm-8.px-0(v-model='currentCourse')
    .page-header
      h2.text-center.my-2 {{ currentCourse.subject + ' ' + currentCourse.number }}
    #users-list
      b-list-group
        b-list-group-item.user.rounded-0.border(v-for='user in users', :key='user.email')
          | {{ user }}
  b-modal#modal1(title='Add a course', @shown='clearQuery', hide-footer)
    b-form-input.mb-1(type='text', placeholder='Search for a course...', v-model='courseQuery', @keyup='search')
    b-list-group
      b-list-group-item.rounded-0.border(v-for='course in courseHits', :key='course.uuid', action)
        .d-flex.w-100.justify-content-between.mx-3(@click='addCourse(course)')
          h5 {{ course.title }}
          small.text-right(style='min-width: 80px;') {{ course.subject + ' ' + course.number }}
</template>

<script>
import { mapGetters } from 'vuex';
import { default as swal } from 'sweetalert2';
import { courseIndex } from '../services/algolia';

const course = {
  uuid: '8dd62248-6424-4e33-a745-852fdd31c78a',
  title: 'Software Engineering I',
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
  data () {
    return {
      courses,
      users,
      courseQuery: '',
      courseHits: [],
      currentCourse: courses.length > 0 ? courses[0] : null
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    search() {
      if (!this.courseQuery) {
        this.courseHits = [];
        return false;
      }
      courseIndex.search(this.courseQuery, {
        hitsPerPage: 5
      }, (error, results) => {
        this.courseHits = results.hits;
      });
    },
    clearQuery() {
      this.courseHits = [];
      this.courseQuery = '';
    },
    addCourse(course) {
      this.courses.push(course);
      this.$root.$emit('hide::modal','modal1');
    },
    setCurrentCourse(course) {
      this.currentCourse = course;
    }
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
