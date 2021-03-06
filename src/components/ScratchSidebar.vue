<template>
    <div>
        <v-navigation-drawer
            app
            persistent
            clipped
            enable-resize-watcher
            disable-route-watcher
            v-model="show">
            <v-list>
                <v-subheader v-if="$store.state.channels.channels.length > 0" class="mt-3 grey--text text--darken-1">CHANNELS</v-subheader>
                <template v-for="channel in $store.state.channels.channels">
                    <transition name="slide-fade" mode="out-in" appear>
                        <v-list-tile :key="channel.id" ripple @click="$emit('channel-switch', channel)">
                            <v-list-tile-action>
                                <v-badge color="red darken-1" :value="channel.unread">
                                    <span slot="badge" v-text="Number(channel.unread)"></span>
                                    <v-icon :color="channel.id === $store.getters.currentChannel.id ? 'teal' : 'gray'">{{ channel.icon }}</v-icon>
                                </v-badge>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ channel.label }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </transition>
                </template>
                <v-list-tile class="mt-3" ripple @click="showCreateChannelDialog = true">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1 body-1">Create a channel</v-list-tile-title>
                </v-list-tile>
                <div v-if="localized">
                    <v-subheader class="mt-3 grey--text text--darken-1">GEO-LOCALIZED CHANNEL</v-subheader>
                    <v-list>
                        <v-list-tile ripple @click="$emit('channel-switch', $store.state.channels.geoChannel)">
                            <v-list-tile-action>
                                <v-badge color="red darken-1" :value="$store.state.channels.geoChannel.unread">
                                    <span slot="badge" v-text="Number($store.state.channels.geoChannel.unread)"></span>
                                    <v-icon :color="$store.getters.currentChannel.id === '#geo' ? 'teal' : 'gray'">{{ $store.state.channels.geoChannel.icon }}</v-icon>
                                </v-badge>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ $store.state.channels.geoChannel.label }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </div>
                <v-subheader v-if="$store.state.channels.privateChannels.length > 0" class="mt-3 grey--text text--darken-1">PRIVATE MESSAGES</v-subheader>
                <v-list v-if="$store.state.channels.privateChannels.length > 0">
                    <template v-for="privateChannel in $store.state.channels.privateChannels">
                        <transition name="slide-fade" mode="out-in" appear>
                            <v-list-tile :key="privateChannel.id" ripple avatar @click="$emit('channel-switch', privateChannel)">
                                <v-badge left color="red darken-1" overlap :value="privateChannel.unread">
                                    <span slot="badge" v-text="Number(privateChannel.unread)"></span>
                                    <v-list-tile-avatar class="grey--text red--after">
                                        <img :src="getPrivateChannelAvatar(privateChannel.users)" alt="">
                                    </v-list-tile-avatar>
                                </v-badge>
                                <v-list-tile-content v-text="getPrivateChannelLabel(privateChannel)"></v-list-tile-content>
                                <v-list-tile-action>
                                    <v-icon :color="privateChannel.id === $store.getters.currentChannel.id ? 'teal' : 'gray'">chat_bubble</v-icon>
                                </v-list-tile-action>
                            </v-list-tile>
                        </transition>
                    </template>
                </v-list>
                <v-list-tile class="mt-3" ripple @click="showCreatePrivateChannelDialog = true">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1 body-1">Start a conversation</v-list-tile-title>
                </v-list-tile>
                <v-list-tile class="mt-3" ripple @click="$emit('poll-view')">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">poll</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1">Polls</v-list-tile-title>
                </v-list-tile>
                <v-list-tile ripple @click="account">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">settings</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1">Settings</v-list-tile-title>
                </v-list-tile>
                <v-list-tile ripple @click="$emit('logout')">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">exit_to_app</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1">Logout</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-navigation-drawer
            app
            clipped
            right
            enable-resize-watcher
            disable-route-watcher
            v-model="showContextDrawer">
            <v-card flat class="teal lighten-2">
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout row wrap>
                            <v-flex layout align-center justify-center>
                                <v-avatar
                                    size="70px"
                                    class="grey lighten-4">
                                    <img :src="$store.state.auth.user.avatar" alt="avatar">
                                </v-avatar>
                                <span class="headline white--text">&nbsp;{{ $store.state.auth.user.nickname }}</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
            <v-expansion-panel popout>
                <v-expansion-panel-content v-for="user in $store.getters.usersMinusSelf" :key="user.id" ripple>
                    <div slot="header">
                        <v-layout align-center row spacer slot="header">
                            <v-flex xs3>
                                <v-badge left :color="((user.lastActive || 0) + 60000) >= (new Date().getTime()) ? (user.status ? 'green lighten-1' : 'orange darken-1') : 'grey darken-1'" overlap>
                                    <span slot="badge"></span>
                                    <v-avatar size="42px">
                                        <img :src="user.avatar" :alt="user.nickname">
                                    </v-avatar>
                                </v-badge>
                            </v-flex>
                            <v-flex xs9>
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="user.nickname" class="teal--text subheading"></v-list-tile-title>
                                    <v-list-tile-sub-title v-text="user.id.replace('@kuzzle.io', '')"></v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-flex>
                        </v-layout>
                    </div>
                    <v-card>
                        <v-card-media :src="user.avatar" height="200px"></v-card-media>
                        <v-card-title>
                            <div>
                                <div class="headline">{{ user.nickname }}</div>
                                <span class="grey--text" v-text="user.id.replace('@kuzzle.io', '')"></span>
                            </div>
                        </v-card-title>
                        <v-card-text v-if="user.ido !== ''" class="subheading"><blockquote><i>"{{ user.ido }}"</i></blockquote></v-card-text>
                        <v-card-actions>
                            <v-btn block class="green--text darken-1" flat @click.native="$emit('start-one-to-one', user.id)">Chat<v-icon right dark>chat</v-icon></v-btn>
                            <v-btn block class="pink--text darken-1" flat @click.native="$emit('bump', user.id)">Bump!<v-icon right dark>notifications_active</v-icon></v-btn>
                        </v-card-actions>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-navigation-drawer>
        <v-toolbar dark app fixed clipped-left clipped-right class="teal lighten-1">
            <v-toolbar-title>
                <v-toolbar-side-icon @click.native.stop="show = !show"></v-toolbar-side-icon>
            </v-toolbar-title>
            <span class="title"><transition name="slide-fade" mode="out-in" appear><v-chip v-if="typeof title !== 'undefined'" label :key="title"><v-icon left>{{ icon }}</v-icon>{{ title }}</v-chip></transition></span>
            <v-spacer></v-spacer>
            <v-text-field
                label="Search..."
                single-line
                append-icon="search"
                dark
                hide-details
                v-model="searchInput"
                @input="searchMessages">
            </v-text-field>
            <v-card class="teal lighten-1 elevation-0" height="60px">
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout row wrap>
                            <v-flex layout>
                                <p class="body-2 white--text">Powered by</p>
                            </v-flex>
                            <img height="30" style="" src="/static/kuzzle.png"/>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
            <v-btn icon dark @click.native.stop="showContextDrawer = !showContextDrawer"><v-icon>more_vert</v-icon></v-btn>
        </v-toolbar>
        <v-dialog v-model="showCreateChannelDialog" persistent>
            <v-card>
                <v-card-title class="teal">
                    <span class="headline white--text">New channel</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field label="Title" v-model="newChannelTitle" required></v-text-field>
                    <v-select
                        v-bind:items="channelIcons"
                        v-model="newChannelIcon"
                        label="Icon"
                        item-text="label"
                        item-value="icon"
                        autocomplete>
                        <template slot="selection" scope="data">
                            <v-icon class="grey--text text--darken-1">{{ data.item.icon }}</v-icon>
                        </template>
                        <template slot="item" scope="data">
                            <v-list-tile-action>
                                <v-icon class="grey--text text--darken-1">{{ data.item.icon }}</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content v-text="data.item.label"></v-list-tile-content>
                        </template>
                    </v-select>
                    <v-checkbox
                        label="Restricted access"
                        v-model="newChannelRestricted"
                        color="teal"
                        value="restricted"
                        hide-details></v-checkbox>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-btn block class="green--text" type="submit" flat @click.native="createChannel" :loading="loading">Create</v-btn>
                    <v-btn block class="orange--text" flat @click.native="showCreateChannelDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showCreatePrivateChannelDialog" persistent max-width="60%">
            <v-card>
                <v-card-title class="teal">
                    <span class="headline white--text">Start a conversation</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field label="Private channel label" v-model="newPrivateChannelTitle" required></v-text-field>
                    <v-select
                        v-bind:items="$store.getters.usersMinusSelf"
                        v-model="privateChatUsers"
                        label="Users"
                        multiple
                        hint="Let's talk with..."
                        chips
                        item-text="nickname"
                        item-value="id"
                        autocomplete>
                        <template slot="selection" scope="data">
                            <transition name="slide-fade" appear>
                                <v-chip
                                    close
                                    @input="data.parent.selectItem(data.item)"
                                    @click.native.stop
                                    class="chip--select-multi teal lighten-2 white--text subheading"
                                    :key="data.item">
                                    <v-avatar>
                                        <img :src="data.item.avatar">
                                    </v-avatar>
                                    {{ data.item.nickname }}
                                </v-chip>
                            </transition>
                        </template>
                        <template slot="item" scope="data">
                            <v-list-tile-avatar>
                                <img :src="data.item.avatar"/>
                            </v-list-tile-avatar>
                            <v-list-tile-content v-text="data.item.nickname"></v-list-tile-content>
                        </template>
                    </v-select>
                </v-card-text>
                <v-card-actions>
                    <v-btn block class="green--text" type="submit" flat @click.native="createPrivateChannel" :loading="loading">Let's chat!</v-btn>
                    <v-btn block class="orange--text" flat @click.native="showCreatePrivateChannelDialog = false">Nevermind</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
  import Document from 'kuzzle-sdk/src/Document'
  import { SET_CHANNELS, SET_PRIVATE_CHANNELS, ADD_TO_CHANNELS, DELETE_FROM_CHANNELS } from '../vuex/modules/channels/mutation-types'

  export default {
    name: 'scratch-sidebar',
    data () {
      return {
        show: true,
        showContextDrawer: true,
        showCreateChannelDialog: false,
        loading: false,
        channelIcons: [{ icon: 'forum', label: 'Default' }, { icon: 'announcement', label: 'Announcement' }, { icon: 'android', label: 'Android' }, { icon: 'bug_report', label: 'Bug' }, { icon: 'favorite', label: 'Favorite' }, { icon: 'flight_takeoff', label: 'Flight' }, { icon: 'fingerprint', label: 'Fingerprint' }, { icon: 'gif', label: 'Gif' }, { icon: 'group_work', label: 'Group work' }, { icon: 'help', label: 'Help' }, { icon: 'info', label: 'Info' }, { icon: 'home', label: 'Home' }, { icon: 'label', label: 'Label' }, { icon: 'language', label: 'Language' }, { icon: 'lightbulb_outline', label: 'Idea' }, { icon: 'lock', label: 'Lock' }, { icon: 'motorcycle', label: 'Motorcycle' }, { icon: 'record_voice_over', label: 'Voice' }, { icon: 'schedule', label: 'Schedule' }, { icon: 'room', label: 'Map' }, { icon: 'report_problem', label: 'Alert' }, { icon: 'search', label: 'Search' }, { icon: 'shopping_cart', label: 'Shopping' }, { icon: 'theaters', label: 'Movie' }, { icon: 'translate', label: 'Translation' }, { icon: 'trending_up', label: 'Trends' }, { icon: 'work', label: 'Work' }, { icon: 'library_music', label: 'Music' }, { icon: 'play_circle_outline', label: 'Video' }, { icon: 'call', label: 'Phone' }, { icon: 'chat_bubble', label: 'Chat' }, { icon: 'weekend', label: 'Weekend' }, { icon: 'attach_money', label: 'Money' }, { icon: 'insert_emoticon', label: 'Smile' }, { icon: 'videogame_asset', label: 'Video Games' }, { icon: 'tv', label: 'TV' }, { icon: 'directions_run', label: 'Run' }, { icon: 'local_cafe', label: 'Coffee' }, { icon: 'beach_access', label: 'Beach' }, { icon: 'cake', label: 'Birthday' }, { icon: 'school', label: 'School' }],
        newChannelTitle: '',
        newPrivateChannelTitle: '',
        newChannelRestricted: false,
        newChannelIcon: '',
        showCreatePrivateChannelDialog: false,
        privateChatUsers: [],
        searchInput: ''
      }
    },
    computed: {
      title: function () { return this.$store.state.channels.currentChannel.type === 'private' ? this.getPrivateChannelLabel(this.$store.state.channels.currentChannel) : this.$store.state.channels.currentChannel.label },
      icon: function () { return this.$store.state.channels.currentChannel.type === 'private' ? 'forum' : this.$store.state.channels.currentChannel.icon },
      localized: function () { return this.$store.state.auth.user.localized }
    },
    mounted () {
      let initSideBar = function () {
        this.initializeChannels()
        this.initializePrivateChannels()
      }.bind(this)

      setTimeout(initSideBar, 200)
    },
    methods: {
      initializeChannels () {
        window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).search({ query: { terms: { type: ['public', 'restricted'] } } }, { size: 100 }, (err, res) => {
          if (!err) {
            this.$store.dispatch(SET_CHANNELS, res.documents)
          }

          this.subscribeToChannels()
        })
      },
      initializePrivateChannels () {
        setTimeout(() => {
          window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).search({ query: { bool: { should: [{ bool: { must: [{ match_phrase_prefix: { 'users': this.$store.state.auth.user.id } }, { match_phrase_prefix: { type: 'private' } }] } }] } } }, { size: 100 }, (err, res) => {
            if (!err) {
              this.$store.dispatch(SET_PRIVATE_CHANNELS, res.documents)
            }
          })
        }, 200)
      },
      subscribeToChannels () {
        window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).subscribe({}, (err, res) => {
          if (!err) {
            if (res.action === 'create') {
              if ((['public', 'restricted'].includes(res.document.content.type)) || (res.document.content.type === 'private' && res.document.content.users.includes(this.$store.state.auth.user.id))) {
                this.$store.dispatch(ADD_TO_CHANNELS, res.document)
              }
            }
            if (res.action === 'delete') {
              this.$store.dispatch(DELETE_FROM_CHANNELS, res.document)
            }
          }
        })
      },
      createChannel () {
        this.loading = true

        let channel = new Document(window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX), {
          label: this.newChannelTitle,
          type: this.newChannelRestricted ? 'restricted' : 'public',
          icon: this.newChannelIcon || 'forum'
        })

        window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument('#' + this.newChannelTitle, channel, (err, res) => {
          if (!err) {
            this.closeCreateChannelDialog()
          }
        })
      },
      closeCreateChannelDialog () {
        this.showCreateChannelDialog = false
        this.loading = false
        this.newChannelTitle = ''
        this.newChannelRestricted = false
        this.newChannelIcon = 'forum'
      },
      createPrivateChannel () {
        this.loading = true

        this.privateChatUsers.push(this.$store.state.auth.user.id)

        let channel = new Document(window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX), {
          label: this.newPrivateChannelTitle,
          type: 'private',
          icon: this.privateChatUsers.length === 2 ? 'end2end' : 'multiple',
          users: this.privateChatUsers
        })

        window.kuzzle.collection(window.Scratch.SCRATCH_CHANNEL_COLLECTION, window.Scratch.SCRATCH_INDEX).createDocument(this.newChannelTitle, channel, (err, res) => {
          if (!err) {
            this.closeCreatePrivateChannelDialog()
          }
        })
      },
      closeCreatePrivateChannelDialog () {
        this.showCreatePrivateChannelDialog = false
        this.loading = false
        this.privateChatUsers = []
        this.newPrivateChannelTitle = ''
      },
      getPrivateChannelAvatar (users) {
        if (users.length === 2) {
          return users[0] === this.$store.state.auth.user.id ? this.$store.getters.getUserById(users[1]).avatar : this.$store.getters.getUserById(users[0]).avatar
        }

        return '/static/private-channel.png'
      },
      getPrivateChannelLabel (channel) {
        if (channel.label === '' && channel.users.length === 2) {
          return channel.users[0] === this.$store.state.auth.user.id ? this.$store.getters.getUserById(channel.users[1]).nickname : this.$store.getters.getUserById(channel.users[0]).nickname
        }

        return channel.label
      },
      searchMessages () {
        this.$emit('search-messages', this.searchInput)
      },
      account () {
        this.$router.push({ path: '/account' })
      }
    }
  }
</script>

<style scoped>
  .slide-fade-enter-active {
    transition: all .1s ease;
  }
  .slide-fade-leave-active {
    transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for <2.1.8 */ {
    transform: translateX(100px);
    opacity: 0;
  }
</style>
