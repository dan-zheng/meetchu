// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueMeta from 'vue-meta';
import VueForm from 'vue-form';
import VueSelect from 'vue-select';
import BootstrapVue from 'bootstrap-vue';
import VueSocketIO from 'vue-socket.io';

// Sadly necessary to manually import bootstrap because
// bootstrap-vue modal doesn't work with vue-form.
import jQuery from 'jquery';
import Tether from 'tether';
window.$ = jQuery;
window.jQuery = jQuery;
window.Tether = Tether;
const Bootstrap = require('bootstrap');

import store from './store';
import router from './router';
import sockets from './sockets';
import * as types from './store/mutation-types';
import App from './App';

Vue.use(VueAxios, axios);
Vue.use(VueMeta);
Vue.use(VueForm);
Vue.use(BootstrapVue);
Vue.use(VueSocketIO, process.env.SOCKET_URL, store);
Vue.component('v-select', VueSelect);

sync(store, router);

// TODO: Fix baseURL for production/development server
// May require splitting client/server into separate repos
const protocol = window.location.protocol;
const hostname = window.location.hostname;
const port = process.env.PORT || 3000;
Vue.axios.defaults.baseURL = `${protocol}//${hostname}:${port}`;
Vue.axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.config.productionTip = false;

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  store,
  router,
  sockets,
  template: '<App/>',
  components: { App }
});
