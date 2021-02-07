import { Entity, html, ready } from '../../../src/index.js'
import JetCounter from './JetCounter.js'

const Demo = new Entity({
  selector: 'body',
  name: 'demo',

  references: {
    primaryCounter: 'jet-counter[key="1"]',
    secondaryCounter: 'jet-counter[key="2"]'
  },

  on: {
    initialize () {
      this.render(html`
        <h1>Jet Components Example</h1>
        <p>
          Jet Components are just Web Components, enhanced with Jet's rendering/reconciliation, data handling, state management and other features. Anything you can do with an Entity, you can do with a Component. If you open the inspector and watch the components as you increment or decrement the counter, you will see that the reconciliation takes place inside the component's shadow DOM.
        </p>

        <h2>Counter 1</h2>
        <jet-counter key="1"></jet-counter>

        <section>
          <h2>Counter 2</h2>
          <jet-counter key="2"></jet-counter>
        </section>
      `)
    }
  }
})

ready(() => Demo.initialize())
