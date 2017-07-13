<template>
    <v-dialog v-model="show" persistent>
        <v-tabs v-model="currentTab" dark icons centered>
            <v-tabs-bar slot="activators" class="light-green darken-2">
                <v-tabs-slider class="yellow"></v-tabs-slider>
                <v-tabs-item href="#tab-login">
                    <v-icon>fingerprint</v-icon>Login
                </v-tabs-item>
                <v-tabs-item href="#tab-register">
                    <v-icon>verified_user</v-icon>Register
                </v-tabs-item>
            </v-tabs-bar>
            <v-tabs-content
                :key="login"
                :id="'tab-login'">
                <v-card>
                    <v-card-title>
                        <span class="headline">Login to Scratch</span>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field label="Email" required v-model="loginEmail"></v-text-field>
                        <v-text-field label="Password" type="password" required v-model="loginPassword"></v-text-field>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block class="orange--text" type="submit" flat @click.native="login" :loading="loading">Login</v-btn>
                    </v-card-actions>
                </v-card>
            </v-tabs-content>
            <v-tabs-content
                :key="register"
                :id="'tab-register'">
                <v-card>
                    <v-card-title>
                        <span class="headline">❤ Join Scratch️</span>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field label="Email" required v-model="registerEmail"></v-text-field>
                        <v-text-field label="Nickname" required v-model="registerNickname"></v-text-field>
                        <v-text-field label="Password" type="password" required v-model="registerPassword"></v-text-field>
                        <v-text-field label="Password confirmation" type="password" required v-model="registerPasswordConfirmation"></v-text-field>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block class="orange--text" flat @click.native="register">Register</v-btn>
                    </v-card-actions>
                </v-card>
            </v-tabs-content>
        </v-tabs>
    </v-dialog>
</template>

<script>
import md5 from 'md5'
import { SET_CURRENT_USER } from '../vuex/modules/auth/mutation-types'

export default {
  name: 'scratch-login-dialog',
  data () {
    return {
      show: false,
      loading: false,
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerNickname: '',
      registerPassword: '',
      registerPasswordConfirmation: '',
      currentTab: 'tab-login',
      errors: []
    }
  },
  mounted () {
    this.checkIfLoggedIn()
  },
  methods: {
    checkIfLoggedIn () {
      setTimeout(() => {
        let token = localStorage.getItem('jwtToken')

        if (token !== null) {
          window.kuzzle.checkToken(token, (err, res) => {
            this.show = !!(err || !res.valid)
            if (!this.show) {
              this.$store.commit(SET_CURRENT_USER, JSON.parse(localStorage.getItem('user')))
            }
          })
        } else {
          this.show = true
        }
      }, 100)
    },
    login () {
      this.loading = true
      this.$store.dispatch(SET_CURRENT_USER, { username: this.loginEmail, password: this.loginPassword })
        .then((err, res) => {
          this.loading = false
          if (err) {
            this.errors.push(err.message)
          } else {
            this.show = false
          }
        })
    },
    register () {
      this.errors = []

      if (this.isRegisterFormValid()) {
        this.loading = true

        let userDocument = {
          content: {
            profileIds: ['default'],
            nickname: this.registerNickname,
            avatar: 'http://www.gravatar.com/avatar/' + md5(this.registerEmail) + '?d=identicon'
          },
          credentials: {
            local: {
              username: this.registerEmail,
              password: this.registerPassword
            }
          }
        }

        window.kuzzle.security.createUser(this.registerEmail, userDocument, (err, user) => {
          if (err) {
            this.loading = false
            this.errors.push(err.message)
          } else {
            this.$store.dispatch(SET_CURRENT_USER, {username: this.registerEmail, password: this.registerPassword})
              .then(() => {
                this.loading = false
                this.show = false
              })
          }
        })
      }
    },
    isRegisterFormValid () {
      if (this.isEmpty('register')) {
        this.errors.push('Please fill every fields')
        return false
      }
      if (!this.passwordValid()) {
        this.errors.push('Invalid password')
        return false
      }

      return true
    },
    isEmpty (scenario) {
      if (scenario === 'login') {
        return this.loginEmail.length === 0 || this.loginPassword.length === 0
      }

      return this.registerEmail.length === 0 || this.registerNickname.length === 0 || this.registerPassword.length === 0 || this.registerPasswordConfirmation.length === 0
    },
    passwordValid () {
      if (this.registerPassword.length < 6 || this.registerPasswordConfirmation.length < 6) {
        return false
      }

      return this.registerPassword === this.registerPasswordConfirmation
    }
  }
}
</script>
