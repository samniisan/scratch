<template>
    <div>
        <v-navigation-drawer
            class="pb-0"
            persistent
            clipped
            enable-resize-watcher
            v-model="show">
            <v-list>
                <v-list-tile v-for="channel in $store.state.channels.channels" :key="channel.id" ripple>
                    <v-list-tile-action>
                        <v-icon v-badge="channelUnread(channel)" class="grey--text red--after">{{ channel.icon }}</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title @click="$emit('channel-switch', channel)">{{ channel.label }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile class="mt-3">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title @click="showCreateChannelPopup = true" class="grey--text text--darken-1">Create a channel</v-list-tile-title>
                </v-list-tile>
                <v-subheader class="mt-3 grey--text text--darken-1">PRIVATE MESSAGES</v-subheader>
                <v-list>
                    <v-list-tile v-for="privateChannel in $store.state.channels.privateChannels" :key="privateChannel.id" ripple avatar>
                        <v-list-tile-avatar class="grey--text red--after">
                            <img :src="privateChannel.icon" alt="">
                        </v-list-tile-avatar>
                        <v-list-tile-title v-text="privateChannel.label" @click="$emit('channel-switch', privateChannel)"></v-list-tile-title>
                        <v-list-tile-action>
                            <v-icon v-bind:class="[channelUnread(privateChannel).visible ? 'teal--text' : 'grey--text']" v-badge="channelUnread(privateChannel)">chat_bubble</v-icon>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
                <v-list-tile class="mt-3">
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1">Start a conversation</v-list-tile-title>
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
                    <v-list-tile-title class="grey--text text--darken-1">Settings</v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-action>
                        <v-icon class="grey--text text--darken-1">exit_to_app</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title class="grey--text text--darken-1" @click="$emit('logout')">Logout</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar fixed class="light-green lighten-1">
            <v-toolbar-title>
                <v-toolbar-side-icon @click.native.stop="show = !show"></v-toolbar-side-icon>
            </v-toolbar-title>
            <span class="title"><transition name="slide-fade" mode="out-in" appear><v-chip label :key="title"><v-icon left>forum</v-icon>{{ title }}</v-chip></transition></span>
            <v-spacer></v-spacer>
            <v-text-field
                label="Search..."
                single-line
                append-icon="search"
                dark
                hide-details
            ></v-text-field>
        </v-toolbar>
        <v-dialog v-model="showCreateChannelPopup" persistent>
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
                        color="red"
                        value="restricted"
                        hide-details></v-checkbox>
                    <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                    <v-btn block class="orange--text" type="submit" flat @click.native="createChannel" :loading="loading">Create</v-btn>
                    <v-btn block class="green--text" flat @click.native="showCreateChannelPopup = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Document from 'kuzzle-sdk/src/Document'
import { SET_CURRENT_CHANNEL, SET_CHANNELS, SET_PRIVATE_CHANNELS } from '../vuex/modules/channels/mutation-types'

export default {
  name: 'scratch-sidebar',
  data () {
    return {
      show: true,
      showCreateChannelPopup: false,
      loading: false,
      a1: null,
      channelIcons: [{ icon: 'forum', label: 'Default' }, { icon: 'announcement', label: 'Announcement' }, { icon: 'android', label: 'Android' }, { icon: 'bug_report', label: 'Bug' }, { icon: 'favorite', label: 'Favorite' }, { icon: 'flight_takeoff', label: 'Flight' }, { icon: 'fingerprint', label: 'Fingerprint' }, { icon: 'gif', label: 'Gif' }, { icon: 'group_work', label: 'Group work' }, { icon: 'help', label: 'Help' }, { icon: 'info', label: 'Info' }, { icon: 'home', label: 'Home' }, { icon: 'label', label: 'Label' }, { icon: 'language', label: 'Language' }, { icon: 'lightbulb_outline', label: 'Idea' }, { icon: 'lock', label: 'Lock' }, { icon: 'motorcycle', label: 'Motorcycle' }, { icon: 'record_voice_over', label: 'Voice' }, { icon: 'schedule', label: 'Schedule' }, { icon: 'room', label: 'Map' }, { icon: 'report_problem', label: 'Alert' }, { icon: 'search', label: 'Search' }, { icon: 'shopping_cart', label: 'Shopping' }, { icon: 'theaters', label: 'Movie' }, { icon: 'translate', label: 'Translation' }, { icon: 'trending_up', label: 'Trends' }, { icon: 'work', label: 'Work' }, { icon: 'library_music', label: 'Music' }, { icon: 'play_circle_outline', label: 'Video' }, { icon: 'call', label: 'Phone' }, { icon: 'chat_bubble', label: 'Chat' }, { icon: 'weekend', label: 'Weekend' }, { icon: 'attach_money', label: 'Money' }, { icon: 'insert_emoticon', label: 'Smile' }, { icon: 'videogame_asset', label: 'Video Games' }, { icon: 'tv', label: 'TV' }, { icon: 'directions_run', label: 'Run' }, { icon: 'local_cafe', label: 'Coffee' }, { icon: 'beach_access', label: 'Beach' }, { icon: 'cake', label: 'Birthday' }, { icon: 'school', label: 'School' }],
      newChannelTitle: '',
      newChannelRestricted: false,
      newChannelIcon: 'default'
    }
  },
  computed: {
    title: function () {
      return this.$store.state.channels.currentChannel.label
    }
  },
  mounted () {
    this.$store.dispatch(SET_CURRENT_CHANNEL, { id: '#kuzzle', label: '#kuzzle' })
    this.initializeChannels()
    this.initializePrivateChannels()
  },
  methods: {
    initializeChannels () {
      this.channels = []
      window.kuzzle.collection('slack', 'foo').search({ query: { terms: { type: ['public', 'restricted'] } } }, (err, res) => {
        if (err) {

        } else {
          this.$store.dispatch(SET_CHANNELS, res.documents)
        }

        this.subscribeToChannels()
      })
    },
    initializePrivateChannels () {
      this.privateChannels = []
      window.kuzzle.collection('slack', 'foo').search({ query: { term: { type: 'private' } } }, (err, res) => {
        if (err) {

        } else {
          this.$store.dispatch(SET_PRIVATE_CHANNELS, res.documents)
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
    channelUnread (channel) {
      return channel.unread > 0 ? { value: channel.unread, visible: true } : { visible: false }
    },
    createChannel () {
      this.loading = true

      let channel = new Document(window.kuzzle.collection('slack', 'foo'), {
        label: this.newChannelTitle,
        type: this.newChannelRestricted ? 'restricted' : 'public',
        icon: this.newChannelIcon
      })

      window.kuzzle.collection('slack', 'foo').createDocument('#' + this.newChannelTitle, channel, (err, res) => {
        if (err) {

        } else {
          this.showCreateChannelPopup = false
          this.$emit('channel-switch', {
            id: this.newChannelTitle,
            label: this.newChannelTitle,
            type: this.newChannelRestricted ? 'restricted' : 'public',
            icon: this.newChannelIcon
          })
        }

        this.loading = false
        this.newChannelTitle = ''
        this.newChannelRestricted = false
        this.newChannelIcon = 'default'
      })
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
