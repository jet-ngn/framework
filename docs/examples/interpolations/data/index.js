import { Entity, html, ready } from '../../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'data-binding',

  data: {
    value: {
      type: Number,
      default: Math.random()
    }
  },

  on: {
    initialize () {
      this.render(html`
        <h1>Basic Data Binding</h1>

        <p>
          Value: <span>${this.data.bind('value')}</span>
        </p>

        ${this.bind(html`<button>Randomize Value</button>`, {
          on: {
            click: evt => this.data.value = Math.random()
          }
        })}
      `)
    }
  }
})

ready(() => Demo.initialize())
