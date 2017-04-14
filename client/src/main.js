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
