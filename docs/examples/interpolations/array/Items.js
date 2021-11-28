import { Entity, html } from '../../../src/index.js'
import Item from './Item.js'

export default new Entity({
  name: 'items',

  on: {
    render (evt, items) {
      this.render(html`
        ${items.map(item => html`
          ${Item.render(item)}
        `)}
      `)
    }
  }
})
