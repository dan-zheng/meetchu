<template lang='pug'>
.container
  app-nav
  #main
    router-view
  //-
    div(v-if='authenticated')
      app-sidebar
      #main
        router-view
    div(v-else)
      app-nav
      #main
        router-view
</template>

<script>
import AppNav from './includes/AppNav.vue'
import AppFooter from './includes/AppFooter.vue'
// import AppSidebar from './includes/AppSidebar.vue'

export default {
  name: 'main',
  // components: { AppNav, AppFooter, AppSidebar },
  components: { AppNav, AppFooter },
  data() {
    return {
      // view: 'asdf'
    }
  },
  computed: {
    authenticated() {
      console.log(!!this.$store.state.user);
      return !!this.$store.state.user;
    }
  }
}
</script>

<style lang='scss'>
</style>
