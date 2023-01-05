import { html } from '../tags'

export default {
  name: '404 Not Found',

  get template () {
    return html`
      <div class="not_found">
        404 Not Found
      </div>
    `
  }
}