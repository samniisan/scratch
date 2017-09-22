// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import store from './vuex/store'
import Kuzzle from 'kuzzle-sdk'
import { Picker, Emoji } from 'emoji-mart-vue'

window.kuzzle = new Kuzzle('10.34.50.59')

Vue.use(Vuetify)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    /*
    window.kuzzle.whoAmI((err, user) => {
      if (err || user.id === '-1') {
        next('/login')
      } else {
        next()
      }
    })
    */
    next()
  }
})

Vue.component('picker', Picker)
Vue.component('emoji', Emoji)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store: store
})
