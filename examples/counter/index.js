import { Bus, Entity, DataModel, DataStore, html, ready } from '../../src/index.js'

const Counter = new Entity({
  selector: 'body',
  name: 'counter',

  data: {
    count: {
      type: Number,
      default: 0
    }
  },

  on: {
    initialized () {
      const { data } = this

      this.render(html`
        <h1>Basic Counter Example</h1>

        <p>
          This counter uses Jet's data-binding features to self-update along with application data. No reconciliation process is required to make the updates!
        </p>

        <div>${data.bind('count', count => count === 0 ? 'No' : count)} Item${data.bind('count', count => count === 1 ? '' : 's')}</div>

        ${this.bind({
          on: { click: evt => {
            data.count++
          } }
        }, html`<button>+</button>`)}

        ${this.bind({
          attributes: {
            disabled: data.bind('count', count => count === 0),
          },

          on: { click: evt => data.count-- }
        }, html`<button>-</button>`)}
      `)
    }
  }
})

ready(() => Counter.initialize())
