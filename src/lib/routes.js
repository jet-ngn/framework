import { html } from './tags.js'

export default {
  404: {
    name: '404 Not Found',
    description: 'Default 404 Not Found View',
    scope: '404',

    get template () {
      return html`<div class="404 not_found message">404 Not Found</div>`
    }
  }
}