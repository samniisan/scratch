import ScratchUser from '../../../models/ScratchUser'
import * as types from './mutation-types'

let saveUser = function (res, commit) {
  const user = ScratchUser()

  user.id = res._id

  localStorage.setItem('jwtToken', res.jwt)
  window.kuzzle.setJwtToken(res.jwt)

  return window.kuzzle.collection(window.Scratch.SCRATCH_USERS_COLLECTION, window.Scratch.SCRATCH_INDEX).fetchDocument(user.id, (err, KuzzleUser) => {
    if (!err) {
      user.nickname = KuzzleUser.content.nickname
      user.avatar = KuzzleUser.content.avatar
      user.ido = KuzzleUser.content.ido
      user.darkTheme = KuzzleUser.content.darkTheme || false
      user.localized = false

      localStorage.setItem('user', JSON.stringify(user))

      commit(types.SET_CURRENT_USER, user)
    }
  })
}

let sendCodeToKuzzle = function (strategy, oauthWindow, commit) {
  setTimeout(() => {
    let code
    try {
      code = /code=([a-zA-Z0-9\-_/]+)/.exec(oauthWindow.location.search)
    } catch (ex) {}

    if (code) {
      oauthWindow.close()
      window.kuzzle.query({ controller: 'auth', action: 'login' }, { strategy: strategy, body: { code: code[1] } }, (err, res) => {
        if (err) {
          return
        }
        window.kuzzle.setJwtToken(res.result.jwt)
        saveUser(res, commit)
      })
    } else {
      sendCodeToKuzzle(strategy, oauthWindow, commit)
    }
  }, 500)
}

export default {
  [types.SET_CURRENT_USER] ({commit}, data) {
    return new Promise((resolve, reject) => {
      if (typeof data.strategy !== 'undefined') {
        window.kuzzle.login(data.strategy, (err, res) => {
          if (!err) {
            let oauthWindow = window.open(res.headers.Location, 'scratchOauthPopup', 'width=800, height=600')
            if (oauthWindow === undefined) {
              throw new Error('Cannot open window. Make sure it isn\'t blocked by your browser.')
            }
            sendCodeToKuzzle(data.strategy, oauthWindow, commit)
          } else {
            reject(err)
          }
        })
      } else {
        window.kuzzle.login('local', { username: data.username, password: data.password }, '4h', (err, res) => {
          if (!err) {
            saveUser(res, commit)
            resolve()
          } else {
            reject(err)
          }
        })
      }
    })
  },
  [types.UPDATE_CURRENT_USER] ({commit}, data) {
    commit(types.UPDATE_CURRENT_USER, data)
  }
}
