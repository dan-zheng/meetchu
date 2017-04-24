import Vue from 'vue';
import Router from 'vue-router';

// Get store (necssary for route guarding)
import store from '../store';

import Home from '../components/Home';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Dashboard from '../components/Dashboard';
import Account from '../components/Account';
import Profile from '../components/Profile';
import Chats from '../components/Chats';
import Courses from '../components/Courses';
import Meetings from '../components/meeting/Meetings';
// Test view
import Test from '../components/Test';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home,
      meta: { auth: false }
    },
    {
      path: '/login',
      component: Login,
      meta: { auth: false }
    },
    {
      path: '/signup',
      component: Signup,
      meta: { auth: false }
    },
    {
      path: '/dashboard',
      component: Dashboard,
      meta: { auth: true, sidebar: '/dashboard' }
    },
    {
      path: '/account',
      component: Account,
      meta: { auth: true, sidebar: '/dashboard' }
    },
    {
      path: '/profile/:id',
      component: Profile,
      meta: { auth: true }
    },
    {
      path: '/chats',
      component: Chats,
      meta: { auth: true, sidebar: '/chats' }
    },
    {
      path: '/courses',
      component: Courses,
      meta: { auth: true, sidebar: '/courses' }
    },
    {
      path: '/meetings',
      component: Meetings,
      meta: { auth: true, sidebar: '/meetings' }
    },
    {
      path: '/test',
      component: Test
    }
  ]
});

router.beforeEach((to, from, next) => {
  // Authentication check/route guarding
  // TODO: Edit function to be synchronous, currently runs multiple times
  const promise = router.app.$store.getters.isLoggedIn ? true : router.app.$store.dispatch('checkAuth');

  Promise.all([promise]).then((values) => {
    const loggedIn = router.app.$store.getters.isLoggedIn;
    // console.log(`${loggedIn ? 'Logged in.' : 'Not logged in.'}`);

    // Check if route is independent of auth
    if (typeof to.meta.auth === 'undefined') {
      next();
    }
    // Check if route requires auth
    else if (to.matched.some(record => record.meta.auth)) {
      if (!loggedIn) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    }
    // Check if route requires un-auth
    else if (to.matched.some(record => !record.meta.auth)) {
      if (loggedIn) {
        next({
          path: '/dashboard',
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    } else {
      // Otherwise proceed with redirect
      next();
    }
  });
});

export default router;
