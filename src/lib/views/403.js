import { html } from '../tags'

export default {
  name: '403 Forbidden',

  get template () {
    return html`
      <div class="forbidden">
        403 Forbidden
      </div>
    `
  }
}