<template>
  <v-app
    dark>
    <scratch-sidebar
      @logout="logout"
      @channel-switch="switchChannel"
      @poll-view="showPolls">
    </scratch-sidebar>
    <main>
      <router-view></router-view>
      <v-container fluid>
        <v-layout row wrap>
          <scratch-login-dialog
            show="loginDialog"
            @user-switch="setCurrentUser">
          </scratch-login-dialog>
          <v-flex sm10 offset-sm1 v-if="messages.length > 0">
            <v-card id="chat" height="680px">
              <v-list two-line>
                <template v-for="(message, index) in messages">
                  <v-subheader v-if="message.header" v-text="message.header"></v-subheader>
                  <v-list-tile avatar v-else v-bind:key="message.title">
                    <v-list-tile-avatar>
                      <img v-bind:src="message.avatar">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-title v-html="message.title" v-if="!message.same"></v-list-tile-title>
                      <v-list-tile-sub-title v-html="message.subtitle"></v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-divider v-if="index + 1 < messages.length" inset></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-flex>
          <template v-for="(poll, index) in polls">
              <v-flex sm8 offset-sm2>
                  <v-card>
                      <v-card-media
                          :src="poll.img"
                          height="500px"
                      >
                          <v-container fill-height fluid>
                              <v-layout fill-height>
                                  <v-flex xs6>
                                      <kbd><span class="headline white--text" v-text="poll.title"></span></kbd>
                                      <hr>
                                      <br/>
                                      <v-flex xs4>
                                          <template v-for="(choice, choiceIndex) in poll.choices">
                                              <p>
                                                  <v-chip class="green white--text">
                                                      <v-avatar class="green darken-4"><b>{{ choice.voters }}</b></v-avatar>
                                                      {{ choice.label }}
                                                  </v-chip>
                                                  <v-progress-linear error v-model="choice.rate"></v-progress-linear>
                                              </p>
                                          </template>
                                      </v-flex>
                                  </v-flex>
                              </v-layout>
                          </v-container>
                      </v-card-media>
                      <v-card-actions class="white">
                          <v-spacer></v-spacer>
                          <template v-for="(choice, choiceIndex) in poll.choices">
                              <span @click="sendVote(poll, choiceIndex, choice)">
                                  <v-btn round ripple class="green">{{ choice.label }}</v-btn>
                              </span>
                          </template>
                      </v-card-actions>
                  </v-card>
              </v-flex>
          </template>
        </v-layout>
      </v-container>
      <v-container fluid style="position: fixed; bottom: 0;">
        <v-layout row>
          <v-flex xs12 sm10>
            <v-card hover>
              <v-toolbar class="light-green darken-4" dark dense>
                <v-toolbar-title>Compose</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-icon class="white--text" @click="sendMessage">send</v-icon>
              </v-toolbar>
              <v-container fluid class="pa-0">
                <v-layout wrap>
                  <v-flex xs12>
                    <v-divider></v-divider>
                    <v-text-field
                      v-model="message"
                      full-width
                      multi-line
                      single-line
                      autofocus
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import Document from 'kuzzle-sdk/src/Document'
import ScratchSidebar from '@/components/ScratchSidebar'
import ScratchLoginDialog from '@/components/ScratchLoginDialog'
import { SET_CURRENT_CHANNEL, ADD_TO_CHANNELS, DELETE_FROM_CHANNELS } from '../vuex/modules/channels/mutation-types'

export default {
  name: 'scratch',
  components: { ScratchSidebar, ScratchLoginDialog },
  data () {
    return {
      show: true,
      message: '',
      messages: [],
      polls: [],
      loginDialog: false,
      dialogEmail: '',
      dialogPassword: ''
    }
  },
  watch: {
    polls: (polls) => {
      if (polls.length > 0) {
        polls.forEach(poll => {
          let totalVotes = 0

          for (let key in poll.choices) {
            if (poll.choices.hasOwnProperty(key)) {
              totalVotes += poll.choices[key].voters
            }
          }
          for (let key in poll.choices) {
            if (poll.choices.hasOwnProperty(key)) {
              poll.choices[key].rate = poll.choices[key].voters / totalVotes * 100
            }
          }
        })
      }
    }
  },
  mounted () {
    this.subscribeToMessages()
    this.retrieveMessages(this.currentChannel)
    this.subscribeToChannels()
  },
  methods: {
    logout () {
      window.kuzzle.logout()
      this.loginDialog = true
    },
    subscribeToChannels () {
      window.kuzzle.collection('slack', 'foo').subscribe({}, (err, res) => {
        if (err) {

        } else {
          if (res.action === 'create') {
            this.$store.dispatch(ADD_TO_CHANNELS, res.document)
          }
          if (res.action === 'delete') {
            this.$store.dispatch(DELETE_FROM_CHANNELS, res.document)
          }
        }
      })
    },
    subscribeToMessages () {
      window.kuzzle.collection('slack-messages', 'foo').subscribe({}, { subscribeToSelf: false }, (err, res) => {
        let message = res.document

        if (err) {

        } else {
          if (message.content.channel === this.$store.state.channels.currentChannel.id) {
            this.messages.push({
              avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg',
              title: message.content.user.nickname,
              subtitle: message.content.content
            })
            this.scrollToBottom()
          } else {
            if (message.content.channel.substring(0, 1) === '#') {
              this.$store.state.channels.channels.forEach((channel) => {
                if (channel.id === message.content.channel) {
                  this.$store.dispatch('INCREMENT_UNREAD', channel)
                }
              })
            } else {
              this.$store.state.channels.privateChannels.forEach((channel) => {
                if (channel.id === message.content.channel) {
                  this.$store.dispatch('INCREMENT_UNREAD', channel)
                }
              })
            }
          }
        }
      })
    },
    retrieveMessages () {
      this.messages = []

      window.kuzzle.collection('slack-messages', 'foo').search({ query: { term: { channel: this.$store.state.channels.currentChannel.id.replace('#', '') } }, sort: [{ timestamp: 'asc' }] }, { size: 100 }, (err, res) => {
        if (err) {

        } else {
          if (res.total > 0) {
            res.documents.forEach(message => {
              this.messages.push({
                avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg',
                title: message.content.user.nickname,
                subtitle: message.content.content
              })
            })
          } else {
            this.messages.push({ header: 'This discussion is empty, try saying something nice!' })
          }

          this.scrollToBottom()
        }
      })
    },
    sendMessage () {
      let message = new Document(window.kuzzle.collection('slack-messages', 'foo'), {
        user: this.$store.state.auth.user,
        content: this.message,
        timestamp: Date.now(),
        channel: this.$store.state.channels.currentChannel.id
      })

      window.kuzzle.collection('slack-messages', 'foo').createDocument(message, (err, res) => {
        if (err) {

        } else {
          this.messages.push({ avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg', title: message.content.user.nickname, subtitle: message.content.content })
        }

        this.message = ''
        this.scrollToBottom()
      })
    },
    switchChannel (channel) {
      this.polls = []
      if (this.$store.state.channels.currentChannel.id !== channel.id) {
        this.$store.dispatch(SET_CURRENT_CHANNEL, channel)
        this.retrieveMessages()
      }
    },
    setCurrentUser (user) {
      this.$store.state.auth.user = user
      this.loginDialog = false
    },
    scrollToBottom () {
      let elem = this.$el.querySelector('#chat')
      setTimeout(() => {
        elem.scrollTop = elem.scrollHeight
      }, 0)
    },
    showPolls () {
      this.messages = []
      this.$store.dispatch(SET_CURRENT_CHANNEL, { id: '#polls', label: 'Polls' })
      this.initPolls()
    },
    initPolls () {
      window.kuzzle.collection('slack-polls', 'foo').search({}, (err, res) => {
        if (err) {

        } else {
          this.polls = []

          res.documents.forEach(poll => {
            this.polls.push({ id: poll.id, img: poll.content.img, title: poll.content.question, choices: poll.content.choices })
          })

          window.kuzzle.collection('slack-polls', 'foo').subscribe({}, (err, res) => {
            if (err) {

            } else {
              this.polls.forEach((poll, index) => {
                if (poll.id === res.document.id) {
                  this.polls.splice(index, 1, { id: res.document.id, img: res.document.content.img, title: res.document.content.question, choices: res.document.content.choices })
                }
              })
            }
          })
        }
      })
    },
    sendVote (poll, choiceIndex, choice) {
      console.log('SEND')
      let choices = {}

      choice.voters = choice.voters + 1
      choices[choiceIndex] = choice

      window.kuzzle.collection('slack-polls', 'foo').updateDocument(poll.id, { choices: choices }, (err, res) => {
        if (err) {
          console.log('ERR: ' + JSON.stringify(err))
        } else {
          console.log('RES: ' + JSON.stringify(res))
        }
      })
    }
  }
}
</script>

<style scoped>
#chat {
  overflow: overlay;
}
</style>
