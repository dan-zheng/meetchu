<template lang='pug'>
.container.text-center
  h1#title Group study made easy.
  p#subtitle Meetchu simplifies messaging and scheduling so you can spend less time looking at the calendar and more time getting your work done.
  .row.text-center
    img(src='../assets/img/meetchu.svg', style='max-width: 80%;')
  router-link.btn.btn-lg.btn-primary(to='/login', role='button') Get started
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style lang='scss' scoped>
.container {
  padding-top: 1.5vw;
}
</style>
