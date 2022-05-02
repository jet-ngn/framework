import { html } from './tags.js'

export default {
  404: {
    name: '404 Not Found',
    scope: '404',

    render () {
      return html`<div class="404 not_found message">404 Not Found</div>`
    }
  }
}