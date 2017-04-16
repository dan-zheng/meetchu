<template lang='pug'>
#sidebar
  ul.nav.sidebar-nav
    li.sidebar-brand
      router-link(to='/dashboard')
        img(src='static/img/icon-avatar.svg')
    li
      router-link(to='/chats')
        img(src='static/img/icon-chat.svg')
    li
      router-link(to='/meetings')
        img(src='static/img/icon-cal.svg')
    li
      router-link(to='/courses')
        img(src='static/img/icon-pencil.svg')
</template>

<script>
export default {
  name: 'sidebar',
  data () {
    return {
      msg: 'Sidebar'
    }
  }
}
</script>

<style lang='scss'>
@import '~bootstrap/scss/_mixins';
@import 'static/styles/sidebar.scss';
</style>
