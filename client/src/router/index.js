import Vue from 'vue';
import Router from 'vue-router';

// Get store (necssary for route guarding)
import store from '../store';

import Main from '../components/Main';
import Home from '../components/Home';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Dashboard from '../components/Dashboard';
import Test from '../components/Test';

Vue.use(Router);

const router = new Router({
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
  ]
});

router.beforeEach((to, from, next) => {
  // Route guarding
  const loggedIn = router.app.$store.getters.isLoggedIn;
  console.log(`${loggedIn ? 'Logged in.' : 'Not logged in.'}`);

  if (to.matched.some(record => record.meta.auth)) {
    // Check if route requires auth
    if (!loggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => !record.meta.auth)) {
    // Check if route requires un-auth
    if (loggedIn) {
      next({
        path: '/dashboard',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    // Otherwise redirect
    next();
  }
});

export default router;
