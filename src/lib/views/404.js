import { html } from '../templates/tags'

export default {
  name: '404 Not Found',

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
      <div class="not_found">
        404 Not Found
      </div>
    `
  }
}