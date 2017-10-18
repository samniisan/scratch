import {
  SET_CURRENT_CHANNEL,
  SET_CHANNELS,
  SET_PRIVATE_CHANNELS,
  ADD_TO_CHANNELS,
  DELETE_FROM_CHANNELS,
  INCREMENT_UNREAD, SET_SPEAKING
} from './mutation-types'
import ScratchChannel from '../../../models/ScratchChannel'
import actions from './actions'
import * as getters from './getters'

let geoChannel = ScratchChannel()
geoChannel.id = '#geo'
geoChannel.label = 'Geo channel'
geoChannel.icon = 'location_on'
geoChannel.type = 'geo'
geoChannel.speaking = []
geoChannel.typingMessage = ''
geoChannel.users = []

const state = {
  currentChannel: ScratchChannel(),
  channels: [],
  geoChannel,
  privateChannels: []
}

let checkAllUnread = function () {
  let unread = false

  state.channels.forEach(function (c) {
    if (c.unread > 0) {
      unread = true
    }
  })
  state.privateChannels.forEach(function (pc) {
    if (pc.unread > 0) {
      unread = true
    }
  })

  window.document.getElementById('scratch-favicon').setAttribute('href', unread ? '/static/favicon-active.ico' : '/static/favicon.ico')
}

export const mutations = {
  [SET_CURRENT_CHANNEL] (state, channel) {
    channel.unread = 0
    if (typeof getters.getChannelById(state)(channel.id) !== 'undefined') {
      channel.speaking = getters.getChannelById(state)(channel.id).speaking
    } else {
      channel.speaking = []
    }
    channel.typingMessage = ''
    state.currentChannel = channel
    checkAllUnread()
  },
  [SET_CHANNELS] (state, channels) {
    state.channels = channels
  },
  [SET_PRIVATE_CHANNELS] (state, privateChannels) {
    state.privateChannels = privateChannels
  },
  [ADD_TO_CHANNELS] (state, channel) {
    if (channel.type === 'private') {
      state.privateChannels.push(channel)
    } else {
      state.channels.push(channel)
    }
  },
  [DELETE_FROM_CHANNELS] (state, channelId) {
    state.channels.forEach((channel, index) => {
      if (channel.id === channelId) {
        state.channels.splice(index, 1)
      }
    })
    state.privateChannels.forEach((channel, index) => {
      if (channel.id === channelId) {
        state.privateChannels.splice(index, 1)
      }
    })
  },
  [INCREMENT_UNREAD] (state, channel) {
    channel.unread = channel.unread + 1 || 1
    window.document.getElementById('scratch-favicon').setAttribute('href', '/static/favicon-active.ico')
  },
  [SET_SPEAKING] (state, data) {
    let channel = getters.getChannelById(state)(data.channel)
    let speaking = []

    if (typeof channel !== 'undefined') {
      if (channel.speaking.filter(speaking => speaking.userId === data.userId).length === 0) {
        speaking = {userId: data.userId, typing: data.typing}
        channel.speaking.push(speaking)
        if (data.channel === state.currentChannel.id) {
          state.currentChannel.speaking = channel.speaking
        }
      } else {
        channel.speaking.forEach(speaking => {
          if (speaking.userId === data.userId) {
            speaking.typing = data.typing
          }
        })
        if (data.channel === state.currentChannel.id) {
          state.currentChannel.speaking.forEach(speaking => {
            if (speaking.userId === data.userId) {
              speaking.typing = data.typing
            }
          })
        }
      }
    }
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
