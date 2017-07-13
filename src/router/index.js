import Vue from 'vue'
import Router from 'vue-router'
import Scratch from '@/components/Scratch'
import ScratchAccount from '@/components/ScratchAccount'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Scratch',
      component: Scratch,
      meta: {
        auth: true
      },
      children: [
        {
          path: '/account',
          component: ScratchAccount
        }
      ]
    },
    {
      path: '/login',
      name: 'Login'
    }
  ]
})
