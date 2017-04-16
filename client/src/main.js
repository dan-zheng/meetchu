// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueMeta from 'vue-meta';
import VueForm from 'vue-form';
import BootstrapVue from 'bootstrap-vue';

import router from './router';
import store from './store';
import * as types from './store/mutation-types';
import App from './App';

Vue.use(VueAxios, axios);
Vue.use(VueMeta);
Vue.use(VueForm);
Vue.use(BootstrapVue);

sync(store, router);

const port = process.env.PORT || 3000;
Vue.axios.defaults.baseURL = `http://localhost:${port}`;
Vue.axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.config.productionTip = false;

/* eslint-disable no-new */
const vue = new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
});
