import { html } from '../rendering/tags'

export default {
  name: '401 Unauthorized',

  render () {
    return html`
      <div class="unauthorized">
        401 Unauthorized
      </div>
    `
  }
}