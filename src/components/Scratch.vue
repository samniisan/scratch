<template>
  <v-app
    dark
    standalone>
    <v-navigation-drawer
      class="pb-0"
      persistent
      absolute
      clipped
      enable-resize-watcher
      v-model="drawer">
      <v-list dense>
        <v-list-tile v-for="channel in channels" :key="channel.id">
          <v-list-tile-action>
            <v-icon v-badge="channelUnread(channel)" class="grey--text red--after">{{ channel.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title @click="switchChannel(channel)">
              {{ channel.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-subheader class="mt-3 grey--text text--darken-1">PRIVATE MESSAGES</v-subheader>
        <v-list>
          <v-list-tile v-for="privateChannel in privateChannels" :key="privateChannel.id" avatar>
            <v-list-tile-avatar v-badge="channelUnread(privateChannel)" class="grey--text red--after">
              <img :src="`https://randomuser.me/api/portraits/men/${privateChannel.picture}.jpg`" alt="">
            </v-list-tile-avatar>
            <v-list-tile-title v-text="privateChannel.text" @click="switchChannel(privateChannel)"></v-list-tile-title>
          </v-list-tile>
        </v-list>
        <v-list-tile class="mt-3">
          <v-list-tile-action>
            <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-title class="grey--text text--darken-1">Start a conversation</v-list-tile-title>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon class="grey--text text--darken-1">settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-title class="grey--text text--darken-1">Settings</v-list-tile-title>
        </v-list-tile>
        <v-list-tile>
            <v-list-tile-action>
                <v-icon class="grey--text text--darken-1">exit_to_app</v-icon>
            </v-list-tile-action>
            <v-list-tile-title class="grey--text text--darken-1" @click="logout">Logout</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar class="light-green lighten-1">
      <v-toolbar-title>
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-icon fa fa-fw class="ml-3">youtube</v-icon>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        label="Search..."
        single-line
        append-icon="search"
        dark
        hide-details
      ></v-text-field>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-layout row>
          <v-dialog v-model="loginDialog" persistent>
            <v-card>
              <v-card-title>
                <span class="headline">Login to Scratch</span>
              </v-card-title>
              <v-card-text>
                <v-text-field label="Email" required v-model="dialogEmail"></v-text-field>
                <v-text-field label="Password" type="password" required v-model="dialogPassword"></v-text-field>
                <small>*indicates required field</small>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="blue--text darken-1" flat @click.native="login">Login</v-btn>
                <v-btn class="blue--text darken-2" flat @click.native="register = false">Register</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-flex sm10 offset-sm1>
            <v-card id="chat" height="680px">
                <v-list two-line>
                    <template v-for="message in messages">
                        <v-subheader v-if="message.header" v-text="message.header"></v-subheader>
                        <v-divider v-else-if="message.divider" v-bind:inset="message.inset"></v-divider>
                        <v-list-tile avatar v-else v-bind:key="message.title">
                            <v-list-tile-avatar>
                                <img v-bind:src="message.avatar">
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="message.title"></v-list-tile-title>
                                <v-list-tile-sub-title v-html="message.subtitle"></v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                </v-list>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container fluid style="position: fixed; bottom: 0;">
          <v-layout row>
          <v-flex xs12 sm10>
              <v-card hover>
                  <v-toolbar class="light-green darken-4" dark dense>
                      <v-toolbar-title>Compose</v-toolbar-title>
                      <v-spacer></v-spacer>
                      <v-icon class="white--text" @click="sendMessage()">send</v-icon>
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

export default {
  name: 'scratch',
  data () {
    return {
      drawer: true,
      currentChannel: { id: '#kuzzle', name: '#kuzzle' },
      message: '',
      channels: [],
      privateChannels: [],
      messages: [
        { header: 'Today' }
      ],
      loginDialog: false,
      dialogEmail: '',
      dialogPassword: '',
      currentUser: null
    }
  },
  mounted () {
    this.checkIfLoggedIn()
    this.initializeChannels()
    this.initializePrivateChannels()
    this.subscribeToMessages()
    this.retrieveMessages(this.currentChannel)
  },
  methods: {
    checkIfLoggedIn () {
      window.kuzzle.whoAmI((err, res) => {
        if (err) {
          this.loginDialog = true
        } else {
          if (res.id === '-1') {
            this.loginDialog = true
          } else {
            this.currentUser = res
            this.loginDialog = false
          }
        }
      })
    },
    login () {
      window.kuzzle.login('local', { username: this.dialogEmail, password: this.dialogPassword }, '1h', (err, res) => {
        if (err) {

        } else {
          this.checkIfLoggedIn()
        }
      })
    },
    logout () {
      window.kuzzle.logout()
      this.currentUser = null
      this.loginDialog = true
    },
    register () {

    },
    initializeChannels () {
      this.channels = []
      window.kuzzle.collection('slack', 'foo').search({ query: { terms: { type: ['public', 'restricted'] } } }, (err, res) => {
        if (err) {

        } else {
          res.documents.forEach(channel => {
            this.channels.push({ icon: channel.content.icon, text: channel.content.label, unread: 0, id: channel.id })
          })
        }

        this.subscribeToChannels()
      })
    },
    initializePrivateChannels () {
      this.privateChannels = []
      window.kuzzle.collection('slack', 'foo').search({ query: { term: { type: 'private' } } }, (err, res) => {
        if (err) {

        } else {
          res.documents.forEach(channel => {
            this.privateChannels.push({ picture: Math.floor(Math.random() * 100), text: channel.content.label, unread: 0, id: channel.id })
          })
        }
      })
    },
    subscribeToChannels () {
      window.kuzzle.collection('slack', 'foo').subscribe({}, (err, res) => {
        if (err) {

        } else {
          switch (res.action) {
            case 'create':
              if (res.document.content.type === 'private') {
                this.privateChannels.push({ icon: res.document.content.icon, text: res.document.content.label, id: res.document.id })
              } else {
                this.channels.push({ icon: res.document.content.icon, text: res.document.content.label, id: res.document.id })
              }
              break
            case 'delete':
              console.log(res)
              this.channels.forEach((channel, index) => {
                if (channel.id === res.document.id) {
                  this.channels.splice(index, 1)
                }
              })
              this.privateChannels.forEach((channel, index) => {
                if (channel.id === res.document.id) {
                  this.privateChannels.splice(index, 1)
                }
              })
              break
            default:
              break
          }
        }
      })
    },
    subscribeToMessages () {
      window.kuzzle.collection('slack-messages', 'foo').subscribe({}, { subscribeToSelf: false }, (err, res) => {
        console.log(res)
        let message = res.document

        if (err) {

        } else {
          if (message.content.channel === this.currentChannel.id) {
            this.messages.push({divider: true, inset: true})
            this.messages.push({
              avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg',
              title: message.content.user.name,
              subtitle: message.content.content
            })
          } else {
            if (message.content.channel.substring(0, 1) === '#') {
              this.channels.forEach((channel, index) => {
                if (channel.id === message.content.channel) {
                  this.channels[index].unread = this.channels[index].unread + 1 || 1
                }
              })
            } else {
              this.privateChannels.forEach((channel, index) => {
                if (channel.id === message.content.channel) {
                  this.privateChannels[index].unread = this.privateChannels[index].unread + 1 || 1
                }
              })
            }
          }
        }
      })
    },
    retrieveMessages () {
      this.messages = []
      window.kuzzle.collection('slack-messages', 'foo').search({ query: { term: { channel: this.currentChannel.id.replace('#', '') } }, sort: [{ timestamp: 'asc' }] }, { size: 100 }, (err, res) => {
        if (err) {

        } else {
          if (res.total > 0) {
            res.documents.forEach((message, index) => {
              this.messages.push({
                avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg',
                title: message.content.user.name,
                subtitle: message.content.content
              })
              if (index < res.documents.length - 1) {
                this.messages.push({ divider: true, inset: true })
              }
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
        user: {
          name: this.currentUser.content.nickname,
          avatar: this.currentUser.content.avatar,
          id: this.currentUser.id
        },
        content: this.message,
        timestamp: Date.now(),
        channel: this.currentChannel.id
      })

      window.kuzzle.collection('slack-messages', 'foo').createDocument(message, (err, res) => {
        if (err) {

        } else {
          this.messages.push({ divider: true, inset: true })
          this.messages.push({ avatar: 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg', title: message.content.user.name, subtitle: message.content.content })
        }

        this.message = ''
        this.scrollToBottom()
      })
    },
    switchChannel (channel) {
      this.currentChannel = Object.assign(channel, { unread: 0 })
      this.retrieveMessages()
    },
    channelUnread (channel) {
      return channel.unread > 0 ? { value: channel.unread, visible: true } : { visible: false }
    },
    scrollToBottom () {
      let elem = this.$el.querySelector('#chat')
      setTimeout(() => {
        elem.scrollTop = elem.scrollHeight
      }, 10)
    }
  }
}
</script>

<style scoped>
#chat {
  overflow: overlay;
}
</style>
