import Vue from 'vue'
import {
  SET_USERS,
  ADD_TO_USERS,
  UPDATE_USER,
  DELETE_USER
} from './mutation-types'
import actions from './actions'
import * as getters from './getters'

const state = {
  users: []
}

export const mutations = {
  [SET_USERS] (state, users) {
    state.users = users
  },
  [ADD_TO_USERS] (state, user) {
    state.users.push(user)
  },
  [UPDATE_USER] (state, user) {
    let userIndex = state.users.indexOf(getters.getUserById(state)(user.id))

    Object.keys(user).forEach(function (v, i) {
      Vue.set(state.users[userIndex], v, user[v])
    })
  },
  [DELETE_USER] (state, userId) {
    let user = getters.getUserById(state)(userId)

    state.users[state.users.indexOf(user)] = Object.assign(user, getters.getDeletedUser())
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
