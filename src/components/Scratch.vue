<template>
    <v-app
        :dark="dark"
        :light="!dark">
        <scratch-sidebar
            @logout="logout"
            @channel-switch="switchChannel"
            @poll-view="showPolls"
            @search-messages="searchMessages"
            @show-user-details="showUserDetails"
            @start-one-to-one="startOneToOnePrivateChannel"
            @bump="bump">
        </scratch-sidebar>
        <transition name="slide-fade" mode="out-in" appear>
            <v-snackbar
                top
                right
                warning
                v-model="bumpSnackbar"
                class="black--text">
                <kbd>{{ bumper.user.nickname }} bumped you</kbd>&nbsp;<template v-if="bumper.back">back</template>!
                <v-btn flat class="pink--text" @click.native="bump(bumper.user.id, 1); bumpSnackbar = false;">Bump back!</v-btn>
                <v-btn flat @click.native="bumpSnackbar = false" class="black--text">Close</v-btn>
            </v-snackbar>
        </transition>
        <main>
            <v-container style="margin-top: 60px;">
                <v-layout align-center justify-center>
                    <v-flex sm12>
                        <div>
                            <transition name="slide-fade" mode="out-in" appear>
                                <router-view></router-view>
                            </transition>
                            <transition name="slide-fade" mode="out-in" appear>
                                <v-flex sm8 offset-sm2 v-if="searchResults.length > 0 && searchInput.length > 0">
                                    <v-card>
                                        <v-card-title primary-title>
                                            <div>
                                                <div class="headline">Search in messages</div>
                                                <span class="grey--text"><pre><v-icon>search</v-icon>{{ searchResults.length }} result(s)</pre></span>
                                            </div>
                                        </v-card-title>
                                        <v-list>
                                            <template v-for="searchResult in searchResults">
                                                <transition name="slide-fade" mode="out-in">
                                                <v-list-tile avatar>
                                                    <v-list-tile-avatar>
                                                        <img v-bind:src="$store.getters.getUserById(searchResult.userId).avatar">
                                                    </v-list-tile-avatar>
                                                    <v-list-tile-content>
                                                        <v-list-tile-sub-title><v-chip label outline dark class="caption teal teal--text"><v-icon>{{ searchResult.channel.icon }}</v-icon>&nbsp;{{ searchResult.channel.label }}</v-chip>&nbsp;<b>{{$store.getters.getUserById(searchResult.userId).nickname}}</b>: <i>"{{ searchResult.content }}"</i></v-list-tile-sub-title>
                                                    </v-list-tile-content>
                                                    <v-list-tile-action>
                                                        <v-list-tile-action-text>{{ searchResult.timestamp }}</v-list-tile-action-text>
                                                    </v-list-tile-action>
                                                </v-list-tile>
                                                </transition>
                                            </template>
                                        </v-list>
                                    </v-card>
                                </v-flex>
                            </transition>
                            <v-subheader v-if="searchResults.length > 0 && searchInput.length > 0"></v-subheader>
                            <v-flex sm8 offset-sm2 v-if="messages.length > 0">
                                <v-card>
                                    <v-list two-line>
                                        <transition-group name="slide-fade" mode="out-in" appear>
                                            <template v-for="(message, index) in messages">
                                                <div :key="index">
                                                    <v-subheader v-if="message.header" v-text="message.header"></v-subheader>
                                                    <v-list-tile avatar v-else v-bind:key="message.title">
                                                        <v-list-tile-avatar>
                                                            <img v-bind:src="message.avatar">
                                                        </v-list-tile-avatar>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title v-html="message.title" v-if="!message.same"></v-list-tile-title>
                                                            <v-list-tile-sub-title v-html="message.subtitle"></v-list-tile-sub-title>
                                                        </v-list-tile-content>
                                                        <v-list-tile-action>
                                                            <v-list-tile-action-text>{{ message.timestamp }}</v-list-tile-action-text>
                                                        </v-list-tile-action>
                                                    </v-list-tile>
                                                    <v-divider v-if="index + 1 < messages.length"></v-divider>
                                                </div>
                                            </template>
                                        </transition-group>
                                    </v-list>
                                </v-card>
                            </v-flex>
                        </div>
                        <v-flex sm8 offset-sm2 v-for="(poll, index) in polls" :key="poll.id">
                            <v-card>
                                <v-card-media
                                    :src="poll.img"
                                    height="500px">
                                    <v-container fill-height fluid>
                                        <v-layout fill-height>
                                            <v-flex>
                                                <kbd><span class="headline white--text" v-text="poll.title"></span></kbd>
                                                <v-subheader></v-subheader>
                                                <v-flex>
                                                    <template v-for="(choice, choiceIndex) in poll.choices">
                                                        <p>
                                                            <v-chip class="teal darken-1 white--text">
                                                                <v-avatar class="teal darken-4"><b>{{ choice.voters }}</b></v-avatar>
                                                                {{ choice.label }}
                                                            </v-chip>
                                                            <v-progress-linear height="20" v-model="choice.rate" :color="getRateColor(choice.rate, 1)" :background-color="getRateColor(choice.rate)"></v-progress-linear>
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
                                      <v-btn round ripple dark class="teal lighten-2">{{ choice.label }}</v-btn>
                                  </span>
                                    </template>
                                </v-card-actions>
                            </v-card>
                            <v-subheader></v-subheader>
                        </v-flex>
                        <v-flex sm8 offset-sm2 v-if="$router.history.current.name === 'scratch-polls'">
                            <v-btn outline raised block class="teal--text" @click="showCreatePollDialog = true">Create a new poll</v-btn>
                            <v-dialog v-model="showCreatePollDialog" persistent width="60%">
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">New poll</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <input type="file" v-on:change="imgToBase64"/>
                                        <v-text-field label="Question" v-model="newPollQuestion" required></v-text-field>
                                        <v-text-field v-for="index in [1, 2, 3, 4]" :label="'Choice #' + index" v-model="newPollChoices[index - 1]" required></v-text-field>
                                        <small>*indicates required field</small>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn block class="green--text" type="submit" flat @click.native="createPoll" :loading="loading">Create</v-btn>
                                        <v-btn block class="orange--text" flat @click.native="showCreatePollDialog = false">Cancel</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-flex>
                    </v-flex>
                </v-layout>
                <span style="position:sticky;" v-if="messages.length > 0">
                    <v-container>
                        <v-layout>
                            <v-flex sm8 offset-sm2>
                                <v-card>
                                    <v-toolbar class="teal darken-4" dense dark>
                                        <v-toolbar-title row>Compose</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <scratch-typing></scratch-typing>
                                        <v-icon class="white--text" @click="emojiHidden = !emojiHidden">face</v-icon>&nbsp;
                                        <v-icon class="white--text" @click="sendMessage">send</v-icon>
                                    </v-toolbar>
                                    <v-container fluid class="pa-0">
                                        <v-layout wrap>
                                            <v-flex xs12>
                                                <v-divider></v-divider>
                                                <v-text-field
                                                    v-model="message"
                                                    full-width
                                                    single-line
                                                    autofocus
                                                    @keyup.enter="checkInput"
                                                    @input="typing">
                                                </v-text-field>
                                            </v-flex>
                                        </v-layout>
                                    </v-container>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex sm8 offset-sm2>
                                <picker @click="addEmoji" v-if="!emojiHidden"></picker>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </span>
            </v-container>
            <v-dialog v-model="showUserDetailsDialog" lazy>
                <v-card v-if="typeof userDetails.id !== 'undefined'">
                    <v-card-media :src="userDetails.avatar" height="200px"></v-card-media>
                    <v-card-title primary-title>
                        <div>
                            <div class="headline">{{ userDetails.nickname }}</div>
                            <span class="grey--text">{{ userDetails.id }}</span>
                        </div>
                    </v-card-title>
                    <v-card-text v-if="userDetails.ido !== ''" class="subheading"><blockquote><i>"{{ userDetails.ido }}"</i></blockquote></v-card-text>
                    <v-card-actions>
                        <v-btn block class="green--text darken-1" flat="flat" @click.native="showUserDetailsDialog = false; startOneToOnePrivateChannel(userDetails.id)">Chat<v-icon right dark>chat</v-icon></v-btn>
                        <v-btn block class="pink--text darken-1" flat="flat" @click.native="showUserDetailsDialog = false; bump(userDetails.id, false)">Bump!<v-icon right dark>notifications_active</v-icon></v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </main>
    </v-app>
</template>

<script>
  import Document from 'kuzzle-sdk/src/Document'
  import ScratchSidebar from '@/components/ScratchSidebar'
  import ScratchTyping from '@/components/ScratchTyping'
  import { SET_USERS, ADD_TO_USERS, UPDATE_USER, DELETE_USER } from '../vuex/modules/users/mutation-types'
  import { SET_CURRENT_CHANNEL, SET_SPEAKING } from '../vuex/modules/channels/mutation-types'

  export default {
    name: 'scratch',
    components: { ScratchSidebar, ScratchTyping },
    data () {
      return {
        show: true,
        loading: false,
        message: '',
        messages: [],
        polls: [],
        showLoginDialog: false,
        dialogEmail: '',
        dialogPassword: '',
        searchInput: '',
        searchResults: [],
        bumpSnackbar: false,
        bumper: { user: {}, back: false },
        showCreatePollDialog: false,
        newPollQuestion: '',
        newPollChoices: ['', '', '', ''],
        newPollImg: '',
        emojiHidden: true,
        userDetails: {},
        showUserDetailsDialog: false
      }
    },
    computed: {
      loginDialog: function () { return this.showLoginDialog },
      dark: function () { return this.$store.state.auth.user.darkTheme || false }
    },
    watch: {
      '$route' (to, from) {
        this.polls = []
        this.messages = []
        if (to.name === 'scratch-channel') {
          let channel = this.$store.getters.getChannelById(to.params.id)

          if (this.$store.state.channels.currentChannel.id !== channel.id) {
            this.$store.dispatch(SET_CURRENT_CHANNEL, channel)
            this.retrieveMessages()
          }
        }
        window.scrollTo(0, 0)
      },
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
      this.initializeUsers()

      let initScratch = function () {
        if (this.$route.name === 'scratch-channel') {
          let initCurrentChannel = function () {
            let channel = this.$store.getters.getChannelById(this.$route.params.id)
            this.$store.dispatch(SET_CURRENT_CHANNEL, {
              id: channel.id,
              label: channel.label,
              icon: channel.icon,
              type: channel.type,
              users: []
            })
            this.subscribeToMessages()
            this.retrieveMessages()
          }.bind(this)
          setTimeout(initCurrentChannel, 200)
        } else if (this.$route.name === 'scratch-polls') {
          this.showPolls()
        } else {
          this.$store.dispatch(SET_CURRENT_CHANNEL, { id: '#kuzzle', label: '#kuzzle', icon: 'forum', users: [] })
          this.subscribeToMessages()
          this.retrieveMessages()
        }
      }.bind(this)

      setTimeout(initScratch, 600)
    },
    methods: {
      logout () {
        window.kuzzle.logout()
        localStorage.removeItem('user')
        localStorage.removeItem('jwtToken')
        this.$router.push('/login')
      },
      initializeUsers () {
        window.kuzzle.collection('slack-users', 'foo').search({}, { size: 100 }, (err, res) => {
          if (!err) {
            this.$store.dispatch(SET_USERS, res.documents)

            this.subscribeToUsers()
          }
        })
      },
      subscribeToUsers () {
        window.kuzzle.collection('slack-users', 'foo').subscribe({}, { subscribeToSelf: false }, (err, res) => {
          if (!err) {
            if (res.action === 'create') {
              this.$store.dispatch(ADD_TO_USERS, res.document)
            }
            if (res.action === 'update' || res.action === 'replace') {
              this.$store.dispatch(UPDATE_USER, res.document)
            }
            if (res.action === 'delete') {
              this.$store.dispatch(DELETE_USER, res.document.id)
            }
          }
        })
      },
      subscribeToMessages () {
        window.kuzzle.collection('slack-messages', 'foo').subscribe({}, { subscribeToSelf: false }, (err, res) => {
          let message = res.document

          if (!err) {
            if (message.content.event === 'typing') {
              this.$store.dispatch(SET_SPEAKING, message.content)

              return
            }
            if (message.content.event === 'bump' && message.content.bumping === this.$store.state.auth.user.id) {
              this.bumper = {
                user: this.$store.getters.getUserById(message.content.userId),
                back: message.content.back
              }
              this.bumpSnackbar = true

              return
            }
            if (message.content.channel === this.$store.state.channels.currentChannel.id) {
              this.pushMessage(message)

              return
            }
            if (message.content.channel.substring(0, 1) === '#') {
              this.$store.state.channels.channels.forEach(channel => {
                if (channel.id === message.content.channel) {
                  this.$store.dispatch('INCREMENT_UNREAD', channel)
                }
              })
            } else {
              this.$store.state.channels.privateChannels.forEach(channel => {
                if (channel.id === message.content.channel) {
                  this.$store.dispatch('INCREMENT_UNREAD', channel)
                }
              })
            }
          }
        })
      },
      retrieveMessages () {
        this.messages = []

        window.kuzzle.collection('slack-messages', 'foo').search({ query: { bool: { should: [{ bool: { must: [{ match_phrase_prefix: { channel: this.$store.state.channels.currentChannel.id.replace('#', '') } }] } }] } }, sort: [{ timestamp: 'asc' }] }, { size: 100 }, (err, res) => {
          if (!err) {
            if (res.total > 0) {
              res.documents.forEach(message => this.pushMessage(message))
            } else {
              this.messages.push({ header: 'This discussion is empty, try saying something nice!' })
            }
          }
        })
      },
      sendMessage () {
        let message = new Document(window.kuzzle.collection('slack-messages', 'foo'), {
          userId: this.$store.state.auth.user.id,
          content: this.message,
          timestamp: Date.now(),
          channel: this.$store.state.channels.currentChannel.id
        })

        window.kuzzle.collection('slack-messages', 'foo').createDocument(message, (err, res) => {
          if (!err) {
            this.pushMessage(message)
          }

          this.message = ''
          this.typing()
        })
      },
      switchChannel (channel) {
        this.$router.push({ name: 'scratch-channel', params: { id: channel.id.replace('#', '') } })
      },
      showPolls () {
        this.$router.push({ path: '/polls' })
        this.messages = []
        this.$store.dispatch(SET_CURRENT_CHANNEL, { id: '#polls', label: 'Polls', icon: 'polls' })
        this.initPolls()
      },
      initPolls () {
        window.kuzzle.collection('slack-polls', 'foo').search({}, (err, res) => {
          if (!err) {
            this.polls = []

            res.documents.forEach(poll => {
              this.polls.push({ id: poll.id, img: poll.content.img, title: poll.content.question, choices: poll.content.choices })
            })

            window.kuzzle.collection('slack-polls', 'foo').subscribe({}, (err, res) => {
              if (!err) {
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
      createPoll () {
        let choices = {}

        this.loading = true

        this.newPollChoices.forEach((e, i) => {
          choices[i] = { label: e, voters: 0, rate: 0 }
        })

        let poll = new Document(window.kuzzle.collection('slack-polls', 'foo'), {
          img: this.newPollImg,
          question: this.newPollQuestion,
          choices: choices
        })

        window.kuzzle.collection('slack-polls', 'foo').createDocument(poll, (err, res) => {
          if (!err) {
            this.loading = false
            this.newPollQuestion = ''
            this.newPollChoices = ['', '', '', '']
            this.newPollImg = ''
            this.polls.push({ id: res.id, img: res.content.img, title: res.content.question, choices: res.content.choices })
            this.showCreatePollDialog = false
          }
        })
      },
      pushMessage (message) {
        let user = this.$store.getters.getUserById(message.content.userId)

        this.messages.push({
          avatar: user.avatar,
          title: user.nickname,
          subtitle: message.content.content,
          timestamp: window.moment(message.content.timestamp, 'x').fromNow()
        })
      },
      sendVote (poll, choiceIndex, choice) {
        let choices = {}

        choices[choiceIndex] = Object.assign(choice, { voters: choice.voters + 1 })

        window.kuzzle.collection('slack-polls', 'foo').updateDocument(poll.id, { choices: choices })
      },
      typing () {
        if (this.message.length <= 1) {
          window.kuzzle.collection('slack-messages', 'foo').publishMessage({
            event: 'typing',
            channel: this.$store.state.channels.currentChannel.id,
            userId: this.$store.state.auth.user.id,
            typing: this.message.length > 0
          })
        }
      },
      checkInput () {
        this.sendMessage()
      },
      searchMessages (searchInput) {
        this.searchInput = searchInput
        window.kuzzle.collection('slack-messages', 'foo').search({
          sort: [{ timestamp: 'desc' }],
          query: { bool: { must: [{ wildcard: { content: '*' + searchInput.toLowerCase() + '*' } }, { terms: { channel: this.$store.getters.channels.map(c => c.id.replace('#', '')) } }] } }
        },
        { from: 0, size: 100 }, (err, res) => {
          if (!err) {
            if (!(this.searchResults.length > 0 && this.searchResults.length === res.total)) {
              this.searchResults = []
              res.documents.forEach(message => {
                let originChannel = this.$store.getters.getChannelById(message.content.channel)
                if (typeof originChannel !== 'undefined') {
                  this.searchResults.push(Object.assign(message.content, {
                    channel: originChannel,
                    timestamp: window.moment(message.content.timestamp, 'x').fromNow()
                  }))
                } else {
                  console.log('Could not find channel with id ' + message.content.channel)
                }
              })
            }
          }
        })
      },
      bump (userId, back) {
        window.kuzzle.collection('slack-messages', 'foo').publishMessage({
          event: 'bump',
          userId: this.$store.state.auth.user.id,
          bumping: userId,
          back: back || false
        })
      },
      getRateColor (rate, front) {
        return (!rate) ? 'grey' : [
          { r: 90, c: 'light-blue' },
          { r: 80, c: 'cyan' },
          { r: 70, c: 'teal' },
          { r: 60, c: 'green' },
          { r: 50, c: 'light-green' },
          { r: 40, c: 'lime' },
          { r: 30, c: 'yellow' },
          { r: 20, c: 'amber' },
          { r: 10, c: 'orange' },
          { r: 0, c: 'deep-orange' }
        ].find(e => {
          return rate >= e.r
        }).c + ' ' + (front ? 'darken-2' : 'lighten-3')
      },
      imgToBase64 () {
        let file = document.querySelector('input[type=file]').files[0]
        let reader = new FileReader()

        reader.addEventListener('load', () => {
          this.newPollImg = reader.result
        }, false)

        reader.readAsDataURL(file)
      },
      addEmoji (emoji) {
        this.message += emoji.native
      },
      showUserDetails (userId) {
        this.userDetails = this.$store.getters.getUserById(userId)
        this.showUserDetailsDialog = true
      },
      startOneToOnePrivateChannel (destinationUserId) {
        let existingChannel = this.$store.state.channels.privateChannels.filter(c => {
          return c.users.length === 2 && c.users.includes(destinationUserId) && c.users.includes(this.$store.state.auth.user.id)
        })

        if (existingChannel.length === 1) {
          this.switchChannel(existingChannel[0])
        } else {
          window.kuzzle.collection('slack', 'foo').createDocument(this.newChannelTitle, new Document(window.kuzzle.collection('slack', 'foo'), {
            label: '',
            type: 'private',
            icon: 'end2end',
            users: [destinationUserId, this.$store.state.auth.user.id]
          }))
        }
      }
    }
  }
</script>

<style scoped>
  .slide-fade-enter-active {
    transition: all .2s ease;
  }
  .slide-fade-leave-active {
    transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for <2.1.8 */ {
    transform: translateY(100px);
    opacity: 0;
  }
</style>
