import {
  SET_CURRENT_USER
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
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
