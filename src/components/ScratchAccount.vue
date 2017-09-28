<template>
    <main>
        <v-container fluid style="margin-top: 60px;">
            <v-layout align-center justify-center>
                <v-flex sm12>
                    <v-flex sm8 offset-sm2 elevation-3>
                        <v-tabs dark fixed centered grow>
                            <v-tabs-bar class="deep-purple darken-3">
                                <v-tabs-slider class="orange"></v-tabs-slider>
                                <v-tabs-item href="#tab-account">
                                    <v-icon>account_box</v-icon>&nbsp;Account
                                </v-tabs-item>
                                <v-tabs-item href="#tab-settings">
                                    <v-icon>settings_applications</v-icon>&nbsp;Settings
                                </v-tabs-item>
                                <v-tabs-item href="#tab-about">
                                    <v-icon>info</v-icon>&nbsp;About
                                </v-tabs-item>
                            </v-tabs-bar>
                            <v-tabs-items>
                                <v-tabs-content
                                    :id="'tab-account'">
                                    <v-card>
                                        <v-card-title>
                                            <v-avatar>
                                                <img :src="accountAvatar">
                                            </v-avatar>
                                            <span class="headline">&nbsp;My account</span>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-text-field label="Nickname" required v-model="accountNickname"></v-text-field>
                                            <v-text-field label="What I do" required v-model="accountIDo"></v-text-field>
                                            <small>*indicates required field</small>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn block class="green--text" type="submit" flat @click.native="accountSave" :loading="accountLoading">Save</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-tabs-content>
                                <v-tabs-content
                                    :id="'tab-settings'">
                                    <v-card>
                                        <v-form v-model="settingsValid" ref="form">
                                            <v-card-title>
                                                <span class="headline">Scratch️ settings</span>
                                            </v-card-title>
                                            <v-card-text>
                                                <v-switch v-bind:label="'Dark theme'" v-model="settingsDarkTheme" color="orange" hide-details></v-switch>
                                            </v-card-text>
                                            <v-flex sm10 offset-sm1 elevation-3>
                                                <v-alert error value="true">
                                                    <span class="title">Red zone</span>
                                                    <v-btn class="amber darken-1 elevation-4"><v-icon right dark>mood_bad</v-icon>&nbsp;Delete my account, permanently</v-btn>
                                                </v-alert>
                                            </v-flex>
                                            <v-card-actions>
                                                <v-btn block flat class="green--text" :loading="settingsLoading" @click="settingsSave">Save</v-btn>
                                            </v-card-actions>
                                        </v-form>
                                    </v-card>
                                </v-tabs-content>
                                <v-tabs-content
                                    :id="'tab-about'">
                                    <v-parallax src="/static/parallax.jpg">
                                        <v-layout column align-center justify-center>
                                            <h1 class="display-4 white--text">Scratch</h1>
                                            <h4><kbd>Join the Scratch community!</kbd></h4>
                                        </v-layout>
                                    </v-parallax>
                                </v-tabs-content>
                            </v-tabs-items>
                        </v-tabs>
                    </v-flex>
                </v-flex>
            </v-layout>
        </v-container>
        <v-snackbar
            :timeout=6000
            :success="snackbarLevel === 'success'"
            :error="snackbarLevel === 'error'"
            v-model="snackbar">
            {{ snackbarText }}
            <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
    </main>
</template>

<script>
  import { SET_CURRENT_USER } from '../vuex/modules/auth/mutation-types'
  import { UPDATE_USER } from '../vuex/modules/users/mutation-types'

  export default {
    components: {},
    name: 'scratch-account',
    data () {
      let currentUser = this.$store.state.auth.user

      return {
        snackbar: false,
        snackbarText: '',
        snackbarLevel: 'success',
        accountLoading: false,
        accountIDo: currentUser.ido,
        accountNickname: currentUser.nickname,
        accountAvatar: currentUser.avatar,
        settingsLoading: false,
        settingsDarkTheme: currentUser.darkTheme || false,
        settingsValid: false
      }
    },
    methods: {
      accountSave () {
        this.accountLoading = true

        window.kuzzle.collection('slack-users', 'foo').updateDocument(this.$store.state.auth.user.id, {
          ido: this.accountIDo,
          nickname: this.accountNickname
        }, (err, res) => {
          if (!err) {
            let updatedUser = Object.assign({ id: this.$store.state.auth.user.id }, res.content)

            localStorage.setItem('user', JSON.stringify(updatedUser))
            this.$store.commit(SET_CURRENT_USER, updatedUser)
            this.$store.commit(UPDATE_USER, updatedUser)

            this.showSnackbar('Your modifications were saved successfully!', 'success')
          } else {
            this.showSnackbar('An error occurred when updating your account', 'error')
          }

          this.accountLoading = false
        })
      },
      settingsSave () {
        this.settingsLoading = true

        if (this.$refs.form.validate()) {
          window.kuzzle.collection('slack-users', 'foo').updateDocument(this.$store.state.auth.user.id, {
            darkTheme: this.settingsDarkTheme
          }, (err, res) => {
            if (!err) {
              let updatedUser = Object.assign({ id: this.$store.state.auth.user.id }, res.content)

              localStorage.setItem('user', JSON.stringify(updatedUser))
              this.$store.commit(SET_CURRENT_USER, updatedUser)
              this.$store.commit(UPDATE_USER, updatedUser)

              this.showSnackbar('Your modifications were saved successfully!', 'success')
            } else {
              this.showSnackbar('An error occurred when updating your account', 'error')
            }

            this.settingsLoading = false
          })
        }
      },
      settingsClear () {
        this.$refs.form.reset()
      },
      showSnackbar (message, level) {
        this.snackbarLevel = level
        this.snackbarText = message
        this.snackbar = true
      }
    }
  }
</script>

<style scoped>
</style>
