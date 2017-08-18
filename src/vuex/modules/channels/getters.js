export const currentChannel = state => {
  return state.currentChannel
}

export const channels = state => {
  return state.channels
}

export const privateChannels = state => {
  return state.privateChannels
}

export const getChannelById = (state, getters) => (id) => {
  if (typeof id === 'string') {
    if (id.startsWith('#')) {
      return state.channels.filter(channel => channel.id === id)[0]
    }

    return state.privateChannels.filter(channel => channel.id === id)[0]
  }
}
