<template lang='pug'>
b-navbar(toggleable, type='inverse', variant='primary', fixed)
  b-nav-toggle(target='nav_collapse_example')
  .container
    b-link.navbar-brand(to='/')
      span Meetchu
    b-collapse#nav_collapse_example(is-nav)
      b-nav.ml-auto(is-nav-bar)
        b-nav-item(to='/login') Login
        b-nav-item(to='/signup') Sign up
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
