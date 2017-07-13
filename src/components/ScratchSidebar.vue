<template>
    <v-navigation-drawer
        class="pb-0"
        persistent
        absolute
        clipped
        enable-resize-watcher
        v-model="drawer">
        <v-list dense>
            <v-list-tile v-for="channel in $store.state.channels.channels" :key="channel.id" ripple>
                <v-list-tile-action>
                    <v-icon v-badge="channelUnread(channel)" class="grey--text red--after">{{ channel.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title @click="$emit('channel-switch', channel)">{{ channel.label }}</v-list-tile-title>
                </v-list-tile-content>
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
</template>

<script>
import { SET_CHANNELS, SET_PRIVATE_CHANNELS } from '../vuex/modules/channels/mutation-types'

export default {
  name: 'scratch-sidebar',
  data () {
    return {
      drawer: true
    }
  },
  computed: {
    show: () => this.drawer
  },
  mounted () {
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
    }
  }
}
</script>
