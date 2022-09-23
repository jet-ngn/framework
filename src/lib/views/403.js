import { html } from '../rendering/tags'

export default {
  name: '403 Forbidden',

  on: {
    abortMount ({ retry }) {
      console.log('ABORT MOUNT', this.name)
    },

    beforeMount ({ abort }) {
      console.log('BEFORE MOUNT ', this.name);
    },

    mount () {
      console.log('MOUNT ', this.name);
    },

    unmount () {
      console.log('UNMOUNT ', this.name);
    }
  },

  render () {
    return html`
      <div class="forbidden">
        403 Forbidden
      </div>
    `
  }
}