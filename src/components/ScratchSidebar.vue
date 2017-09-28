<template>
    <div>
        <v-navigation-drawer
            class="pb-0"
            persistent
            clipped
            enable-resize-watcher
            v-model="show">
            <v-list>
                <template v-for="channel in $store.state.channels.channels">
                    <transition name="slide-fade" mode="out-in" appear>
                        <v-list-tile :key="channel.id" ripple>
                            <v-list-tile-action>
                                <v-icon v-badge="channelUnread(channel)" :class="getChannelIcon(channel)">{{ channel.icon }}</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title @click="$emit('channel-switch', channel)">{{ channel.label }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </transition>
                </template>
                <v-list-tile class="mt-3">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title @click="showCreateChannelDialog = true" class="grey--text text--darken-1">Create a channel</v-list-tile-title>
                </v-list-tile>
                <v-subheader v-if="$store.state.channels.privateChannels.length > 0" class="mt-3 grey--text text--darken-1">PRIVATE MESSAGES</v-subheader>
                <v-list v-if="$store.state.channels.privateChannels.length > 0">
                    <template v-for="privateChannel in $store.state.channels.privateChannels">
                        <transition name="slide-fade" mode="out-in" appear>
                            <v-list-tile :key="privateChannel.id" ripple avatar>
                                <v-list-tile-avatar class="grey--text red--after">
                                    <img :src="getPrivateChannelAvatar(privateChannel.users)" alt="">
                                </v-list-tile-avatar>
                                <v-list-tile-title v-text="getPrivateChannelLabel(privateChannel)" @click="$emit('channel-switch', privateChannel)"></v-list-tile-title>
                                <v-list-tile-action>
                                    <v-icon v-bind:class="[channelUnread(privateChannel).visible ? 'teal--text' : 'grey--text']" v-badge="channelUnread(privateChannel)">chat_bubble</v-icon>
                                </v-list-tile-action>
                            </v-list-tile>
                        </transition>
                    </template>
                </v-list>
                <v-list-tile class="mt-3">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title @click="showCreatePrivateChannelDialog = true" class="grey--text text--darken-1">Start a conversation</v-list-tile-title>
                </v-list-tile>
                <v-list-tile class="mt-3">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">poll</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title @click="$emit('poll-view')" class="grey--text text--darken-1">Polls</v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">settings</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1" @click="account">Settings</v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">exit_to_app</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1" @click="$emit('logout')">Logout</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-navigation-drawer
            persistent
            clipped
            right
            floating
            enable-resize-watcher
            v-model="showContextDrawer">
            <v-card class="deep-purple lighten-2 elevation-6">
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
            <v-list>
                <v-list-tile v-for="user in $store.getters.users" :key="user.id" ripple avatar v-if="user.id !== $store.state.auth.user.id">
                    <v-list-tile-avatar class="grey--text red--after">
                        <img :src="user.avatar" alt="">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="user.nickname"></v-list-tile-title>
                        <v-list-tile-sub-title v-text="user.id"></v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-menu
                            transition="scale-transition">
                            <v-btn slot="activator" icon ripple>
                                <v-icon class="grey--text text--lighten-1">menu</v-icon>
                            </v-btn>
                            <v-list>
                                <v-list-tile>
                                    <v-list-tile-title @click="$emit('show-user-details', user.id)">Show details</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile>
                                    <v-list-tile-title @click="$emit('start-one-to-one', user.id)">Start a conversation</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile>
                                    <v-list-tile-title @click="$emit('bump', user.id)">Bump</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar dark fixed class="deep-purple lighten-1">
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
            <v-btn icon dark @click.native.stop="showContextDrawer = !showContextDrawer"><v-icon>more_vert</v-icon></v-btn>
        </v-toolbar>
        <v-dialog v-model="showCreateChannelDialog" persistent>
            <v-card>
                <v-card-title>
                    <span class="headline">New channel</span>
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
                        color="deep-purple"
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
        <v-dialog v-model="showCreatePrivateChannelDialog" persistent width="60%">
            <v-card>
                <v-card-title>
                    <span class="headline">Start a conversation</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field label="Private channel label" v-model="newPrivateChannelTitle" required></v-text-field>
                    <v-select
                        v-bind:items="$store.getters.users"
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
                                    class="chip--select-multi deep-purple lighten-2 white--text subheading"
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
      icon: function () { return this.$store.state.channels.currentChannel.type === 'private' ? 'forum' : this.$store.state.channels.currentChannel.icon }
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
        window.kuzzle.collection('slack', 'foo').search({ query: { terms: { type: ['public', 'restricted'] } } }, (err, res) => {
          if (!err) {
            this.$store.dispatch(SET_CHANNELS, res.documents)
          }

          this.subscribeToChannels()
        })
      },
      initializePrivateChannels () {
        setTimeout(() => {
          window.kuzzle.collection('slack', 'foo').search({ query: { bool: { should: [{ bool: { must: [{ match_phrase_prefix: { 'users': this.$store.state.auth.user.id } }, { match_phrase_prefix: { type: 'private' } }] } }] } } }, (err, res) => {
            if (!err) {
              this.$store.dispatch(SET_PRIVATE_CHANNELS, res.documents)
            }
          })
        }, 200)
      },
      subscribeToChannels () {
        window.kuzzle.collection('slack', 'foo').subscribe({}, (err, res) => {
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
      channelUnread (channel) {
        return channel.unread > 0 ? { value: channel.unread, visible: true } : { visible: false }
      },
      createChannel () {
        this.loading = true

        let channel = new Document(window.kuzzle.collection('slack', 'foo'), {
          label: this.newChannelTitle,
          type: this.newChannelRestricted ? 'restricted' : 'public',
          icon: this.newChannelIcon || 'forum'
        })

        window.kuzzle.collection('slack', 'foo').createDocument('#' + this.newChannelTitle, channel, (err, res) => {
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

        let channel = new Document(window.kuzzle.collection('slack', 'foo'), {
          label: this.newPrivateChannelTitle,
          type: 'private',
          icon: this.privateChatUsers.length === 2 ? 'end2end' : 'multiple',
          users: this.privateChatUsers
        })

        window.kuzzle.collection('slack', 'foo').createDocument(this.newChannelTitle, channel, (err, res) => {
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
      getChannelIcon (channel) {
        return (channel.id === this.$store.getters.currentChannel.id ? 'purple--text text--lighten-2' : 'gray--text') + ' red--after'
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
