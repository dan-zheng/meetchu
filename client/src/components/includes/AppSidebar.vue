<template lang='pug'>
#sidebar
  router-link(to='/dashboard', :class='isActive("/dashboard")')
    img(src='/static/img/icon-avatar.svg')
  router-link(to='/chats', :class='isActive("/chats")')
    img(src='/static/img/icon-chat.svg')
  router-link(to='/meetings', :class='isActive("/meetings")')
    img(src='/static/img/icon-cal.svg')
  router-link(to='/courses', :class='isActive("/courses")')
    img(src='/static/img/icon-pencil.svg')
</template>

<script>
export default {
  name: 'sidebar',
  methods: {
    isActive(route) {
      if (route !== this.$route.path && route === this.$route.meta.sidebar) {
        return 'router-link-active';
      }
      return '';
    }
  }
}
</script>

<style lang='scss'>
@import '~bootstrap/scss/_mixins';
@import 'static/styles/sidebar.scss';
</style>
