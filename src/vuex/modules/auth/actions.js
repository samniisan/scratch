import ScratchUser from '../../../models/ScratchUser'
import * as types from './mutation-types'

export default {
  [types.SET_CURRENT_USER] ({commit}, data) {
    const user = ScratchUser()

    return new Promise((resolve, reject) => {
      window.kuzzle.login('local', { username: data.username, password: data.password }, '4h', (err, res) => {
        if (err) {

        } else {
          user.id = res._id

          localStorage.setItem('jwtToken', res.jwt)

          return window.kuzzle.whoAmI((err, KuzzleUser) => {
            if (err) {

            } else {
              user.nickname = KuzzleUser.content.nickname
              user.avatar = KuzzleUser.content.avatar

              localStorage.setItem('user', JSON.stringify(user))

              commit(types.SET_CURRENT_USER, user)

              resolve()
            }
          })
        }
      })
    })
  }
}
