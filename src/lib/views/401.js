import { html } from '../rendering/tags'

export default {
  name: '401 Unauthorized',

  on: {
    abortMount ({ retry }) {
      console.log('ABORT MOUNT', this.name)
    },

    beforeMount ({ abort }) {
      console.log('BEFORE MOUNT ', this.name);
    },

    mount () {
      console.log('MOUNT ', this.name);
    }
  },

  render () {
    return html`
      <div class="unauthorized">
        401 Unauthorized
      </div>
    `
  }
}