import { html } from './tags.js'

export default {
  404: {
    name: '404 Not Found',
    scope: '404',

    on: {
      mount () {
        this.root.classList.add('404')
      }
    },

    render () {
      return html`404 Not Found`
    }
  }
}