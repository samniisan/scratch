export const isAuthenticated = state => {
  return state.user.id !== undefined
}

export const user = state => {
  return state.user
}
