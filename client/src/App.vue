<template lang='pug'>
#app
  div(v-if='!isLoggedIn')
    app-nav
    router-view
  div#wrapper.d-flex.flex-row.align-items-stretch(v-else)
    app-sidebar.d-flex.flex-column
    router-view
</template>

<script>
import { mapGetters } from 'vuex';

import AppNav from './components/includes/AppNav.vue'
import AppFooter from './components/includes/AppFooter.vue'
import AppSidebar from './components/includes/AppSidebar.vue'

export default {
  name: 'app',
  metaInfo: {
    title: 'Meetchu',
    titleTemplate: '%s | Meetchu'
  },
  components: { AppNav, AppFooter, AppSidebar },
  computed: {
    ...mapGetters([
      'isLoggedIn'
    ])
  }
}
</script>

<style lang='scss'>
// Import custom scss
@import 'static/styles/_fonts';
@import 'static/styles/_variables';

// Import Bootstrap
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import 'static/styles/bootstrap-social.scss';

// Import font-awesome
$fa-font-path: '../static/fonts/font-awesome';
@import '~font-awesome/scss/font-awesome.scss';

// Import sweetalert2
@import '~sweetalert2/dist/sweetalert2.css';

// Import main styles
@import 'static/styles/main.scss';
</style>
