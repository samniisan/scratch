<template>
    <v-app dark>
        <v-layout row justify-center style="position: relative;">
            <v-dialog v-model="show" persistent>
                <v-tabs v-model="currentTab" icons centered>
                    <v-tabs-bar class="teal lighten-1">
                        <v-tabs-slider class="orange"></v-tabs-slider>
                        <v-tabs-item ripple href="#tab-login">
                            <v-icon>fingerprint</v-icon>Login
                        </v-tabs-item>
                        <v-tabs-item ripple href="#tab-register">
                            <v-icon>verified_user</v-icon>Register
                        </v-tabs-item>
                    </v-tabs-bar>
                    <v-tabs-items>
                        <v-tabs-content
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
                                    <v-btn block class="green--text" type="submit" flat @click.native="login" :loading="loading">Login</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-tabs-content>
                        <v-tabs-content
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
                                    <v-btn block class="orange--text" flat @click.native="register" :loading="loading">Register</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-tabs-content>
                    </v-tabs-items>
                </v-tabs>
            </v-dialog>
        </v-layout>
        <v-snackbar
            error
            v-model="showError">
            {{ error }}
            <v-btn dark flat @click.native="showError = false">Close</v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
  import Document from 'kuzzle-sdk/src/Document'
  import md5 from 'md5'
  import { SET_CURRENT_USER } from '../vuex/modules/auth/mutation-types'

  export default {
    name: 'scratch-login',
    data () {
      return {
        show: true,
        loading: false,
        loginEmail: '',
        loginPassword: '',
        registerEmail: '',
        registerNickname: '',
        registerPassword: '',
        registerPasswordConfirmation: '',
        currentTab: 'tab-login',
        error: '',
        showError: false
      }
    },
    mounted () {
      window.clearInterval(window.aliveLoop)
    },
    methods: {
      login () {
        this.loading = true
        this.$store.dispatch(SET_CURRENT_USER, { username: this.loginEmail, password: this.loginPassword })
          .then(() => {
            this.loading = false
            this.show = false
            setTimeout(() => {
              this.$router.push('/')
            }, 100)
          })
          .catch(err => {
            this.loading = false
            this.errorSnackbar(err)
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
              this.errorSnackbar(err)
            } else {
              let newUser = new Document(window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX), this.registerEmail, {
                nickname: userDocument.content.nickname,
                avatar: userDocument.content.avatar,
                ido: '',
                darkTheme: false
              })

              window.kuzzle.collection(window.Scratch.SCRATCH_USERS_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument(newUser, (err, res) => {
                this.loading = false
                if (err) {
                  this.error = err.message
                } else {
                  this.$store.dispatch(SET_CURRENT_USER, { username: this.registerEmail, password: this.registerPassword })
                    .then(() => {
                      this.show = false
                      setTimeout(() => {
                        this.$router.push('/')
                      }, 100)
                    })
                    .catch(err => {
                      this.loading = false
                      this.errorSnackbar(err)
                    })
                }
              })
            }
          })
        }
      },
      isRegisterFormValid () {
        if (this.isEmpty('register')) {
          this.errorSnackbar(Error('Please fill every fields'))
          return false
        }
        if (!this.passwordValid()) {
          this.errorSnackbar(Error('Invalid password'))
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
      },
      errorSnackbar (err) {
        this.error = err.message
        this.showError = true
      }
    }
  }
</script>

<style scoped>
</style>
