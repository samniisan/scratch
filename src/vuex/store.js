import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import channels from './modules/channels/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    channels
  },
  strict: process.env.NODE_ENV !== 'production'
})
