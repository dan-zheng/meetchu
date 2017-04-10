<template lang='pug'>
#app
  router-view
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang='scss'>
// Import scss config
@import 'static/scss/_fonts';
@import 'static/scss/_variables';
@import 'static/scss/_colors';
// Import font-awesome
$fa-font-path: '../static/fonts/font-awesome';
@import '../node_modules/font-awesome/scss/font-awesome.scss';
// Import bootstrap-sass, bootstrap-social
$icon-font-path: '../node_modules/bootstrap-sass/assets/fonts/bootstrap/';
@import '../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap';
@import '../node_modules/bootstrap-social/bootstrap-social.scss';
// Import main styles
@import 'static/scss/main.scss';
</style>
