import { html } from '../parser/tags'

export default {
  name: '404 Not Found',

  render () {
    return html`
      <div class="not_found">
        404 Not Found
      </div>
    `
  }
}