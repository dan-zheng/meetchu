<template lang='pug'>
.container
  .text-center
    h1 You're logged in! :)
    .row
      img#home-logo.mx-auto(src='../assets/img/meetchu.svg')
</template>

<script>
export default {
  name: 'dashboard',
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
