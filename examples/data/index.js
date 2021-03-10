import { Entity, DataModel, html, ready, DataStore } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'data',

  data: {
    string: {
      type: Boolean,
      default: true
    }
  },

  on: {
    initialize () {
      this.render(html`
        ${this.bind({
          attributes: {
            class: [{
              test: this.data.bind('string')
            }]
          }
        }, html`<div>TEST</div>`)}
      `)

      setTimeout(() => {
        this.data.string = false

        setTimeout(() => this.data.string = true, 1500)
      }, 1500)
    }
  }
})

ready(() => Demo.initialize({ data: { test: 'test' } }))
