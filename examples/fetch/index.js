import { Bus, Entity, html } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'fetch',

  on: {
    async initialize () {
      console.log('INITIALIZE')

      this.render(html`
        ${this.fetch('./test.html')}

        <div>HEY</div>
      `)
    },

    initialized () {
      console.log('INITIALIZED')
    }
  }
})

Bus.on('ready', () => Demo.initialize())
