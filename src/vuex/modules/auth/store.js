import {
  SET_CURRENT_USER,
  UPDATE_CURRENT_USER
} from './mutation-types'
import SessionUser from '../../../models/ScratchUser'
import actions from './actions'
import * as getters from './getters'

const state = {
  user: SessionUser()
}

export const mutations = {
  [SET_CURRENT_USER] (state, user) {
    state.user = user
  },
  [UPDATE_CURRENT_USER] (state, data) {
    let updatedUser = Object.assign(state.user, data)

    state.user = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
