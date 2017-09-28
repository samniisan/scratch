import Vue from 'vue'
import VueRouter from 'vue-router'
import Scratch from '@/components/Scratch'
import ScratchLogin from '@/components/ScratchLogin'
import ScratchAccount from '@/components/ScratchAccount'

Vue.use(VueRouter)

let accountRoute = {
  path: '/account',
  name: 'account',
  component: ScratchAccount
}

export default new VueRouter({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: ScratchLogin,
      meta: {
        auth: false
      }
    },
    {
      path: '/',
      name: 'scratch',
      component: Scratch,
      meta: {
        auth: true
      },
      children: [accountRoute]
    },
    {
      path: '/channel/:id',
      name: 'scratch-channel',
      component: Scratch,
      meta: {
        auth: true
      },
      children: [accountRoute]
    },
    {
      path: '/polls',
      name: 'scratch-polls',
      component: Scratch,
      meta: {
        auth: true
      },
      children: [accountRoute]
    }
  ]
})
