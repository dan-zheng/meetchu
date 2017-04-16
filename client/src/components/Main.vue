<template lang='pug'>
div
  div(v-if='!isLoggedIn')
    app-nav
    #main
      router-view
  div(v-else)
    app-sidebar
    #content
      router-view
</template>

<script>
import { mapGetters } from 'vuex';

import AppNav from './includes/AppNav.vue'
import AppFooter from './includes/AppFooter.vue'
import AppSidebar from './includes/AppSidebar.vue'

export default {
  name: 'main',
  components: { AppNav, AppFooter, AppSidebar },
  computed: {
    ...mapGetters([
      'isLoggedIn'
    ])
  }
}
</script>

<style lang='scss'>
</style>
