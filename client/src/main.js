// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuth from 'vue-auth'

// Set up vue-axios
const port = process.env.PORT || 3000;
Vue.use(VueAxios, axios)
Vue.axios.defaults.baseURL = `http://localhost:${port}`;

// Set up vue-auth
/*
Vue.use(VueAuth, {
  auth: require('vue-auth/drivers/auth/bearer.js'),
  http: require('vue-auth/drivers/http/axios.1.x.js'),
  router: require('vue-auth/drivers/router/vue-router.2.x.js'),
  rolesVar: 'role',
  facebookOauth2Data: {
    clientId: '196729390739201'
  },
  googleOauth2Data: {
    clientId: '337636458732-tatve7q4qo4gnpfcenbv3i47id4offbg.apps.googleusercontent.com'
  }
})
*/

// Include jQuery and Bootstrap JS
import jQuery from 'jquery'
global.jQuery = jQuery
const Bootstrap = require('bootstrap-sass')

import router from './router'
import store from './store'
import App from './App'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
