import { Entity, Partial, DataStore, html, ready } from '../../../src/index.js'
import Items from './Items.js'
import Button from './Button.js'

const Demo = new Entity({
  selector: 'body',
  name: 'array',

  data: {
    items: new DataStore({
      autoid: true,

      fields: {
        title: String,
        description: String
      }
    })
  },

  on: {
    'data.items.*' (evt, items) {
      this.emit('items.render', items)
    },

    button: {
      'render-items' (evt, items) {
        this.data.items.load(items)
      }
    },

    initialize () {
      this.render(html`
        <h1>Rendering/reconciling with loops</h1>

        ${this.bind({ entity: Button }, html`<button></button>`)}

        ${this.bind({
          on: {
            click: evt => this.data.items.clear()
          }
        }, html`<button>Remove All</button>`)}

        ${this.bind({ entity: Items }, html`<ol class="items"></ol>`)}
      `)
    }
  }
})

ready(() => Demo.initialize())
