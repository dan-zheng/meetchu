import Vue from 'vue'
import Router from 'vue-router'

import Main from '@/components/Main'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import Test from '@/components/Test'

Vue.use(Router)

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
          path: 'home',
          alias: '',
          component: Home
        },
        {
          path: 'login',
          component: Login
        },
        {
          path: 'signup',
          component: Signup
        }
      ]
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    },
  ]
})
