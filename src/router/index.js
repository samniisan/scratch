import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Scratch from '@/components/Scratch'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/scratch',
      name: 'Scratch',
      component: Scratch
    }
  ]
})
