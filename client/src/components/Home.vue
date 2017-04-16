<template lang='pug'>
.container
  .text-center
    h1#title Group study made easy.
    p#subtitle Meetchu simplifies messaging and scheduling so you can spend less time looking at the calendar and more time getting your work done.
    .row
      img#home-logo.mx-auto(src='static/img/meetchu.svg')
    router-link#btn-login.btn.btn-lg.btn-primary(to='/login', role='button') Get started
</template>

<script>
export default {
  name: 'home',
  metaInfo: {
    title: 'Home'
  }
}
</script>

<style lang='scss' scoped>
.container {
  padding-top: 1.5vw;
}
#home-logo {
  max-width: 80%;
}
</style>
