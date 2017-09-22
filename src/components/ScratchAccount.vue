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
                                            <v-text-field label="Email" required v-model="accountEmail"></v-text-field>
                                            <v-text-field label="Nickname" required v-model="accountNickname"></v-text-field>
                                            <small>*indicates required field</small>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn block class="green--text" type="submit" flat @click.native="login" :loading="accountLoading">Save</v-btn>
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
                                                <v-checkbox label="Do you agree?" v-model="settingsCheckbox" required
                                                ></v-checkbox>
                                                <small>*indicates required field</small>
                                            </v-card-text>
                                            <v-flex sm10 offset-sm1 elevation-3>
                                                <v-alert error value="true">
                                                    <span class="title">Red zone</span>
                                                    <v-btn class="amber darken-1 elevation-4"><v-icon right dark>mood_bad</v-icon>&nbsp;Delete my account, permanently</v-btn>
                                                </v-alert>
                                            </v-flex>
                                            <v-card-actions>
                                                <v-btn block flat class="green--text" @click="settingsSubmit">Submit</v-btn>
                                                <v-btn block flat class="orange--text" @click="settingsClear">Clear</v-btn>
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
    </main>
</template>

<script>
  export default {
    components: {},
    name: 'scratch-account',
    data () {
      return {
        accountLoading: false,
        accountEmail: this.$store.state.auth.user.id,
        accountNickname: this.$store.state.auth.user.nickname,
        accountAvatar: this.$store.state.auth.user.avatar,
        settingsValid: false,
        settingsCheckbox: false
      }
    },
    methods: {
      settingsSubmit () {
        if (this.$refs.form.validate()) {
          this.$refs.form.$el.submit()
        }
      },
      settingsClear () {
        this.$refs.form.reset()
      }
    }
  }
</script>

<style scoped>
</style>
