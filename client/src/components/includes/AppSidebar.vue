<template lang='pug'>
#sidebar
  ul.nav.sidebar-nav
    li.sidebar-brand
      a(href='/')
        img(src='../../assets/img/icon-avatar.svg')
    li
      a(href='/chats')
        img(src='../../assets/img/icon-chat.svg')
    li
      a(href='/meetings')
        img(src='../../assets/img/icon-cal.svg')
    li
      a(href='/courses')
        img(src='../../assets/img/icon-pencil.svg')
</template>

<script>
export default {
  name: 'sidebar',
  data () {
    return {
      msg: 'Navbar'
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
// Import scss config
@import 'static/scss/_variables';
@import '../../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables';
@import 'static/scss/sidebar.scss';
</style>
