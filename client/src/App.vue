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
@import 'static/styles/_fonts';
@import 'static/styles/_variables';

// Import Bootstrap
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import 'static/styles/bootstrap-social.scss';

// Import font-awesome
$fa-font-path: '../static/fonts/font-awesome';
@import '~font-awesome/scss/font-awesome.scss';

// Import sweetalert2
@import '~sweetalert2/dist/sweetalert2.css';

// Import main styles
@import 'static/styles/main.scss';
</style>
