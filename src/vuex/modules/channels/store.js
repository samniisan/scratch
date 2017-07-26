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

const state = {
  currentChannel: ScratchChannel(),
  channels: [],
  privateChannels: []
}

export const mutations = {
  [SET_CURRENT_CHANNEL] (state, channel) {
    channel.unread = 0
    if (typeof getters.getChannelById(state, channel.id) !== 'undefined') {
      channel.speaking = getters.getChannelById(state, channel.id).speaking
    } else {
      channel.speaking = []
    }
    channel.typingMessage = ''
    state.currentChannel = channel
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
  },
  [SET_SPEAKING] (state, data) {
    let channel = getters.getChannelById(state, data.channel)
    let speaking = []

    if (channel.speaking.filter(user => user.user === data.user).length === 0) {
      speaking = {user: data.user, typing: data.typing}
      channel.speaking.push(speaking)
      if (data.channel === state.currentChannel.id) {
        state.currentChannel.speaking.push(speaking)
      }
    } else {
      channel.speaking.forEach(user => {
        if (user.user === data.user) {
          user.typing = data.typing
        }
      })
      if (data.channel === state.currentChannel.id) {
        state.currentChannel.speaking.forEach(user => {
          if (user.user === data.user) {
            user.typing = data.typing
          }
        })
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
