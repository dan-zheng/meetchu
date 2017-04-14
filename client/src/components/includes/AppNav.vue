<template lang='pug'>
.navbar.navbar-default.navbar-fixed-top
  .container
    .navbar-header
      button.navbar-toggle(type='button', data-toggle='collapse', data-target='.navbar-collapse')
        span.sr-only Toggle navigation
        span.icon-bar
        span.icon-bar
        span.icon-bar
      router-link.navbar-brand(to='/')
        span
          | MEETCHU
    .collapse.navbar-collapse
      ul.nav.navbar-nav.navbar-right
        li.divider
        li(class=(title == 'Login') ? 'active' : undefined)
          router-link(to='/login')
            | Log in
        li.divider
        li(class=(title == 'Sign up') ? 'active' : undefined)
          router-link(to='/signup')
            | Sign up
</template>

<script>
export default {
  name: 'navbar',
  data () {
    return {
      msg: 'Navbar'
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss'>
@import 'static/scss/navbar-footer.scss';
</style>
