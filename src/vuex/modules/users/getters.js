export const users = state => {
  return state.users
}

export const usersMinusSelf = (state, getters, rootState) => {
  return state.users.filter(u => u.id !== rootState.auth.user.id)
}

export const getUserById = (state, getters) => (id) => {
  let user = state.users.filter(user => user.id === id)[0]

  return (typeof user !== 'undefined') ? user : getDeletedUser()
}

export const getDeletedUser = () => {
  return {
    nickname: '[deleted user]',
    avatar: 'http://cfile30.uf.tistory.com/image/256FE13F54F1EE2A33D40B'
  }
}
