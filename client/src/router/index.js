import Vue from 'vue';
import Router from 'vue-router';

import Main from '@/components/Main';
import Home from '@/components/Home';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import Dashboard from '@/components/Dashboard';
import Test from '@/components/Test';

Vue.use(Router);

export default new Router({
  // Remove hashbang from url.
  // Server must be configured to handle:
  // https://router.vuejs.org/en/essentials/history-mode.html
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Main,
      children: [
        {
          path: '',
          component: Home
        },
        {
          path: 'login',
          component: Login,
          meta: { auth: false }
        },
        {
          path: 'signup',
          component: Signup,
          meta: { auth: false }
        },
        {
          path: 'dashboard',
          component: Dashboard,
          meta: { auth: true }
        },
      ]
    }
  ],
  beforeEach: (to, from, next) => {
    // TODO: route guarding
    /*
    if (to.matched.some(record => record.meta.auth)) {
      if (!auth.loggedIn()) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    } else {
      next();
    }
    */
  }
});
