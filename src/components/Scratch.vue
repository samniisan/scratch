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
                <v-btn flat @click.native="bumpSnackbar = false" class="white--text">Close</v-btn>
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
                            <v-flex sm8 offset-sm2 v-if="messages.length > 0">
                                <v-card>
                                    <v-list two-line>
                                        <transition-group name="slide-fade" mode="out-in" appear>
                                            <template v-for="(message, index) in messages">
                                                <div :key="index">
                                                    <v-subheader v-if="message.header" v-text="message.header"></v-subheader>
                                                    <v-list-tile avatar v-else v-bind:key="message.title">
                                                        <transition name="slide-fade-left" mode="out-in" appear>
                                                            <v-list-tile-action v-if="highlightedGeoMessage === message.id">
                                                                <v-icon color="teal">location_on</v-icon>
                                                            </v-list-tile-action>
                                                        </transition>
                                                        <v-list-tile-avatar>
                                                            <img v-bind:src="message.avatar">
                                                        </v-list-tile-avatar>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title v-html="message.title" v-if="!message.same"></v-list-tile-title>
                                                            <v-list-tile-sub-title v-if="highlightedGeoMessage === message.id" v-text="message.subtitle" class="subheading teal--text"></v-list-tile-sub-title>
                                                            <v-list-tile-sub-title v-else v-html="message.subtitle"></v-list-tile-sub-title>
                                                        </v-list-tile-content>
                                                        <v-list-tile-action>
                                                            <v-list-tile-action-text v-if="$store.state.channels.currentChannel.id === '#geo'" :class="getGeoDistanceColor(message.location)" v-text="getDistance(message.location) + ' km'"></v-list-tile-action-text>
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
                        <v-flex sm8 offset-sm2 v-if="$store.state.channels.currentChannel.id === '#geo'">
                            <v-card style="z-index: 190;">
                                <div id="geomap" style="height: 320px;"></div>
                            </v-card>
                        </v-flex>
                        <v-flex sm8 offset-sm2 v-if="$router.history.current.name === 'scratch-polls'">
                            <v-btn outline raised block class="teal--text" @click="showCreatePollDialog = true">Create a new poll</v-btn>
                            <v-dialog v-model="showCreatePollDialog" persistent max-width="60%">
                                <v-card>
                                    <v-card-title class="teal">
                                        <span class="headline white--text">New poll</span>
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
                                    <v-toolbar flat class="teal darken-4" dense dark>
                                        <v-toolbar-title row>Compose</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <scratch-typing></scratch-typing>
                                        <v-icon style="cursor:pointer;" class="white--text" @click="giphyDialog" title="Add gif">gif</v-icon>&nbsp;
                                        <v-icon style="cursor:pointer;" class="white--text" @click="emojiHidden = !emojiHidden" title="Add emoji">face</v-icon>&nbsp;
                                        <v-icon style="cursor:pointer;" class="white--text" @click="sendMessage" title="Send">send</v-icon>
                                    </v-toolbar>
                                    <v-container class="pa-0">
                                        <v-text-field
                                            v-model="message"
                                            full-width
                                            single-line
                                            autofocus
                                            @keyup.enter="checkInput"
                                            @input="typing">
                                        </v-text-field>
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
            <v-dialog v-model="showUserDetailsDialog">
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
                        <v-btn block class="green--text darken-1" flat @click.native="showUserDetailsDialog = false; startOneToOnePrivateChannel(userDetails.id)">Chat<v-icon right dark>chat</v-icon></v-btn>
                        <v-btn block class="pink--text darken-1" flat @click.native="showUserDetailsDialog = false; bump(userDetails.id, false)">Bump!<v-icon right dark>notifications_active</v-icon></v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="showGiphyDialog" max-width="40%">
                <v-card>
                    <v-card-media :src="randomGiphy" height="200px"></v-card-media>
                    <v-card-title>
                        <v-container fluid grid-list-md>
                            <v-layout row wrap>
                                <v-flex xs2>
                                    <v-subheader>Search a gif</v-subheader>
                                </v-flex>
                                <v-flex xs10>
                                    <v-text-field
                                        light
                                        v-model="giphyInput"
                                        @input="searchGiphy"
                                        prepend-icon="search">
                                    </v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-title>
                    <v-card-text>
                        <v-container fluid grid-list-xs>
                            <v-layout row wrap>
                                <v-flex
                                    xs4
                                    v-for="g in giphies"
                                    :key="g">
                                    <v-card flat tile>
                                        <v-card-media
                                            :src="g"
                                            height="150px">
                                        </v-card-media>
                                    </v-card>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block class="green--text" flat @click.native="showGiphyDialog = false; sendGiphy">Send</v-btn>
                        <v-btn block class="orange--text" flat @click.native="showGiphyDialog = false">Nevermind</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-bottom-sheet v-model="showSearchResults" scrollable>
                <v-card>
                    <v-card-title primary-title>
                        <div>
                            <div class="headline">Search in messages</div>
                            <span class="grey--text"><pre><v-icon>search</v-icon>{{ searchResults.length }} result(s)</pre></span>
                        </div>
                    </v-card-title>
                    <v-card-text>
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
                    </v-card-text>
                </v-card>
            </v-bottom-sheet>
        </main>
    </v-app>
</template>

<script>
  import Document from 'kuzzle-sdk/src/Document'
  import ScratchSidebar from '@/components/ScratchSidebar'
  import ScratchTyping from '@/components/ScratchTyping'
  import { SET_USERS, ADD_TO_USERS, UPDATE_USER, DELETE_USER } from '../vuex/modules/users/mutation-types'
  import { SET_CURRENT_CHANNEL, SET_SPEAKING } from '../vuex/modules/channels/mutation-types'
  import { UPDATE_CURRENT_USER } from '../vuex/modules/auth/mutation-types'

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
        showUserDetailsDialog: false,
        userLocation: {},
        geomap: null,
        markerCluster: null,
        highlightedGeoMessage: 0,
        showGiphyDialog: false,
        randomGiphy: '',
        giphyInput: '',
        giphies: [],
        searchingGiphy: false,
        status: true
      }
    },
    computed: {
      dark: function () { return this.$store.state.auth.user.darkTheme || false },
      showSearchResults: function () { return this.searchResults.length > 0 && this.searchInput.length > 0 }
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
            if (channel.id === '#geo') {
              this.initMap()
            }
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
      this.checkIfInactive()
      setInterval(this.sendStatus, 50000)

      let initScratch = function () {
        this.sendStatus()
        this.setUserLocation()
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
        window.kuzzle.collection(window.Scratch.SCRATCH_USERS_COLLECTION, window.Scratch.SCRATCH_INDEX).search({ sort: [{ _uid: 'asc' }] }, { size: 100 }, (err, res) => {
          if (!err) {
            this.$store.dispatch(SET_USERS, res.documents)

            this.subscribeToUsers()
          }
        })
      },
      subscribeToUsers () {
        window.kuzzle.collection(window.Scratch.SCRATCH_USERS_COLLECTION, window.Scratch.SCRATCH_INDEX).subscribe({}, { subscribeToSelf: false }, (err, res) => {
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
        window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).subscribe({}, { subscribeToSelf: false }, (err, res) => {
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

        window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).search({ query: { bool: { should: [{ bool: { must: [{ match_phrase_prefix: { channel: this.$store.state.channels.currentChannel.id.replace('#', '') } }] } }] } }, sort: [{ timestamp: 'asc' }] }, { size: 100 }, (err, res) => {
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
        let messageContent = {
          userId: this.$store.state.auth.user.id,
          content: this.message,
          timestamp: Date.now(),
          channel: this.$store.state.channels.currentChannel.id
        }

        if (this.$store.state.channels.currentChannel.id === '#geo') {
          messageContent.location = this.userLocation
        }

        let message = new Document(window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX), messageContent)

        window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument(message, (err, res) => {
          if (!err) {
            this.pushMessage(message)
          }

          this.message = ''
          this.typing()
        })
      },
      giphyDialog () {
        let self = this

        this.showGiphyDialog = true
        window.axios.get('http://api.giphy.com/v1/gifs/trending', {
          params: {
            api_key: window.Scratch.GIPHY_API_KEY,
            limit: 1,
            offset: Math.floor(Math.random() * 100) + 1
          }
        }).then(function (response) {
          self.randomGiphy = response.data.data[0].images.fixed_height.url
        }).catch(function (error) {
          console.log(error)
        })
      },
      searchGiphy () {
        let self = this

        this.giphies = []

        if (this.searchingGiphy) {
          clearTimeout(this.searchingGiphy)
        }
        this.searchingGiphy = setTimeout(function () {
          window.axios.get('http://api.giphy.com/v1/gifs/search', {
            params: {
              api_key: window.Scratch.GIPHY_API_KEY,
              q: self.giphyInput,
              limit: 9,
              offset: 0
            }
          }).then(function (response) {
            response.data.data.forEach(g => {
              self.giphies.push(g.images.fixed_height.url)
            })
          }).catch(function (error) {
            console.log(error)
          })
        }, 1000)
      },
      sendGiphy () {
        this.showGiphyDialog = true
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
        window.kuzzle.collection(window.Scratch.SCRATCH_POLL_COLLECTION, window.Scratch.SCRATCH_INDEX).search({}, (err, res) => {
          if (!err) {
            this.polls = []

            res.documents.forEach(poll => {
              this.polls.push({ id: poll.id, img: poll.content.img, title: poll.content.question, choices: poll.content.choices })
            })

            window.kuzzle.collection(window.Scratch.SCRATCH_POLL_COLLECTION, window.Scratch.SCRATCH_INDEX).subscribe({}, (err, res) => {
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

        let poll = new Document(window.kuzzle.collection(window.Scratch.SCRATCH_POLL_COLLECTION, window.Scratch.SCRATCH_INDEX), {
          img: this.newPollImg,
          question: this.newPollQuestion,
          choices: choices
        })

        window.kuzzle.collection(window.Scratch.SCRATCH_POLL_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument(poll, (err, res) => {
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
        let messageContent = {
          id: message.id,
          avatar: user.avatar,
          title: user.nickname,
          subtitle: message.content.content,
          timestamp: window.moment(message.content.timestamp, 'x').fromNow(),
          location: message.content.location || null
        }

        this.messages.push(messageContent)

        if (message.content.channel === '#geo') {
          if (!this.geomap) {
            setTimeout(function () {
              this.addMarker(messageContent)
            }.bind(this), 1000)
          } else {
            this.addMarker(messageContent)
          }
        }
      },
      sendVote (poll, choiceIndex, choice) {
        let choices = {}

        choices[choiceIndex] = Object.assign(choice, { voters: choice.voters + 1 })

        window.kuzzle.collection(window.Scratch.SCRATCH_POLL_COLLECTION, window.Scratch.SCRATCH_INDEX).updateDocument(poll.id, { choices: choices })
      },
      typing () {
        if (this.message.length <= 1) {
          window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).publishMessage({
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
        window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).search({
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
        window.kuzzle.collection(window.Scratch.SCRATCH_MESSAGES_COLLECTION, window.Scratch.SCRATCH_INDEX).publishMessage({
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
        ].find(e => rate >= e.r).c + ' ' + (front ? 'darken-2' : 'lighten-3')
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
          window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument(this.newChannelTitle, new Document(window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX), {
            label: '',
            type: 'private',
            icon: 'end2end',
            users: [destinationUserId, this.$store.state.auth.user.id]
          }))
        }
      },
      setUserLocation () {
        let self = this

        /* this.userLocation = {
          lat: 43.607436,
          lon: 3.912948
        }
        this.$store.commit(UPDATE_CURRENT_USER, { localized: true })
        this.initMap() */

        try {
          if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
              self.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              }
              self.$store.commit(UPDATE_CURRENT_USER, { localized: true })
              self.initMap()
            })
          } else {
            // Kaliop Mtp
            this.userLocation = {
              lat: 43.603510,
              lon: 3.920410
            }
            this.$store.commit(UPDATE_CURRENT_USER, { localized: true })
            this.initMap()
          }
        } catch (e) {
          console.log(e)
          this.userLocation = {
            lat: 43.603510,
            lon: 3.920410
          }
          this.$store.commit(UPDATE_CURRENT_USER, { localized: true })
          this.initMap()
        }
      },
      getDistance (location) {
        let radlat1 = Math.PI * this.userLocation.lat / 180
        let radlat2 = Math.PI * location.lat / 180
        let theta = this.userLocation.lon - location.lon
        let radtheta = Math.PI * theta / 180
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515

        return (dist * 1.609344).toFixed(2)
      },
      initMap () {
        let self = this

        setTimeout(function () {
          if (self.$store.getters.currentChannel.id === '#geo') {
            if (self.geomap) {
              self.geomap.remove()
            }

            self.geomap = window.L.map('geomap').setView([self.userLocation.lat, self.userLocation.lon], 13)
            window.L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              maxZoom: 18,
              id: 'mapbox.streets',
              accessToken: window.Scratch.MAPBOX_ACCESS_TOKEN
            }).addTo(self.geomap)

            window.L.circle([self.userLocation.lat, self.userLocation.lon], {
              fillColor: '#009688',
              fillOpacity: 0.5,
              radius: 3000
            }).addTo(self.geomap)

            if (!self.markerCluster) {
              self.markerCluster = window.L.markerClusterGroup()
              self.geomap.addLayer(self.markerCluster)
            } else {
              self.markerCluster = window.L.markerClusterGroup()
              self.messages.forEach(self.addMarker)
              self.geomap.addLayer(self.markerCluster)
            }
          }
        }, 1000)
      },
      addMarker (message) {
        let self = this

        let icon = window.L.divIcon({
          className: 'avatar',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
          html: '<img src="' + message.avatar + '"/>'
        })

        let marker = window.L.marker([message.location.lat, message.location.lon], { icon }).addTo(this.geomap)
        marker.messageId = message.id
        marker
          .on('mouseover', function () {
            self.highlightedGeoMessage = this.messageId
          })
          .on('mouseout', function () {
            self.highlightedGeoMessage = 0
          })

        let popup = window.L.popup({ autoPan: false }).setContent('<b>' + message.title + '</b><br/>' + message.subtitle)

        marker.bindPopup(popup).openPopup()
        this.markerCluster.addLayer(marker)
      },
      getGeoDistanceColor (location) {
        let color = 'subheading teal--text'
        let distance = this.getDistance(location)

        return color + [
          { d: 1.5, a: ' text--lighten-4' },
          { d: 1, a: ' text--lighten-3' },
          { d: 0.5, a: ' text--lighten-2' },
          { d: 0.1, a: ' text--lighten-1' },
          { d: 0, a: '' }
        ].find(e => distance >= e.d).a
      },
      sendStatus () {
        window.kuzzle.collection(window.Scratch.SCRATCH_USERS_COLLECTION, window.Scratch.SCRATCH_INDEX).updateDocument(this.$store.state.auth.user.id, {
          status: this.status,
          lastActive: new Date().getTime()
        })
      },
      checkIfInactive () {
        let self = this
        let t

        window.onload = resetTimer
        window.onmousemove = resetTimer
        window.onmousedown = resetTimer
        window.onclick = resetTimer
        window.onscroll = resetTimer
        window.onkeypress = resetTimer

        function setInactive () {
          self.status = false
          self.sendStatus()
        }

        function resetTimer () {
          clearTimeout(t)
          self.status = true
          t = setTimeout(setInactive, 300000)
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
  .slide-fade-left-enter-active {
      transition: all .2s ease;
  }
  .slide-fade-left-leave-active {
      transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-left-enter, .slide-fade-left-leave-to
      /* .slide-fade-leave-active for <2.1.8 */ {
      transform: translateX(-100px);
      opacity: 0;
  }
</style>
