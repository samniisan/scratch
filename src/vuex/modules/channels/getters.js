export const currentChannel = state => {
  return state.currentChannel
}

export const channels = state => {
  return state.channels
}

export const geoChannel = state => {
  return state.geoChannel
}

export const privateChannels = state => {
  return state.privateChannels
}

export const getChannelById = (state, getters) => (id) => {
  if (typeof id === 'string') {
    if (['geo', '#geo'].includes(id)) {
      return state.geoChannel
    }
    let channel = state.channels.filter(channel => [id, '#' + id].includes(channel.id))[0]

    return typeof channel === 'undefined' ? state.privateChannels.filter(channel => channel.id === id)[0] : channel
  }
}
