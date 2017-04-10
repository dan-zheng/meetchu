<template lang='pug'>
.container
  app-nav
  #main
    router-view
</template>

<script>
import AppNav from './includes/AppNav.vue'
import AppFooter from './includes/AppFooter.vue'
export default {
  name: 'main',
  components: { AppNav, AppFooter },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style lang='scss'>
@import '../../static/scss/navbar-footer.scss';
@import '../../node_modules/bootstrap-social/bootstrap-social.css'
</style>
