import { html } from '../rendering/tags'

export default {
  name: '403 Forbidden',

  render () {
    return html`
      <div class="forbidden">
        403 Forbidden
      </div>
    `
  }
}