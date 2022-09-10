import { html } from '../../tags'

export default {
  name: '404 Not Found',

  on: {
    abortMount ({ retry }) {
      console.log('ABORT MOUNT', this.name)
    },

    willMount ({ abort }) {
      console.log('WILL MOUNT ', this.name);
    },

    mount () {
      console.log('MOUNT ', this.name);
    }
  },

  render () {
    return html`404 Not Found`
  }
}