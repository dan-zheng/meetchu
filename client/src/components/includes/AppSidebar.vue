<template lang='pug'>
#sidebar
  router-link(to='/dashboard')
    img(src='static/img/icon-avatar.svg')
  router-link(to='/chats')
    img(src='static/img/icon-chat.svg')
  router-link(to='/meetings')
    img(src='static/img/icon-cal.svg')
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
