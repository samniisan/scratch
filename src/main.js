import Vue from 'vue'
import Vuetify from 'vuetify'
import router from './router'
import { sync } from 'vuex-router-sync'
import store from './vuex/store'
import App from './App'
import Kuzzle from 'kuzzle-sdk'
import { SET_CURRENT_USER } from './vuex/modules/auth/mutation-types'
import { Picker, Emoji } from 'emoji-mart-vue'

window.kuzzle = new Kuzzle('10.34.50.59')

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    setTimeout(() => {
      let token = localStorage.getItem('jwtToken')

      if (token !== null) {
        window.kuzzle.checkToken(token, (err, res) => {
          let valid = !(err || !res.valid)
          if (valid) {
            store.commit(SET_CURRENT_USER, JSON.parse(localStorage.getItem('user')))
            return next()
          } else {
            return next('/login')
          }
        })
      } else {
        return next('/login')
      }
    }, 100)
  }
  next()
})

Vue.use(Vuetify)

Vue.config.productionTip = false

Vue.component('picker', Picker)
Vue.component('emoji', Emoji)

sync(store, router)

/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
