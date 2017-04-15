<template lang='pug'>
#app
  router-view
</template>

<script>
export default {
  name: 'app',
  metaInfo: {
    title: 'Meetchu',
    titleTemplate: '%s | Meetchu'
  }
}
</script>

<style lang='scss'>
// Import custom scss
@import 'static/scss/_fonts';
@import 'static/scss/_variables';

// Import Bootstrap
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import 'static/scss/bootstrap-social.scss';

// Import font-awesome
$fa-font-path: '../static/fonts/font-awesome';
@import '~font-awesome/scss/font-awesome.scss';

// Import main styles
@import 'static/scss/main.scss';
</style>
