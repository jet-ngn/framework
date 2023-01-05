import { html } from '../tags'

export default {
  name: '401 Unauthorized',

  get template () {
    return html`
      <div class="unauthorized">
        401 Unauthorized
      </div>
    `
  }
}