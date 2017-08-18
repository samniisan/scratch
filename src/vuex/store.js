import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth/store'
import channels from './modules/channels/store'
import users from './modules/users/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    channels,
    users
  },
  strict: process.env.NODE_ENV !== 'production'
})
